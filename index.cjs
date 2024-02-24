const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron/main");
const path = require("node:path");
const fs = require("fs").promises;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    win.webContents.openDevTools();

    win.loadFile("index.html");

    async function openFolder() {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });

        if (!canceled) {
            win.webContents.send("openFolder", filePaths[0])
        }
    }

    async function handleFolderContents(folderPath) {
        try {
            const items = await fs.readdir(folderPath);
            const contents = [];

            for (const item of items) {
                const itemPath = path.join(folderPath, item);
                const stat = await fs.stat(itemPath);

                if (stat.isDirectory()) {
                    const subContents = await handleFolderContents(itemPath);
                    contents.push({
                        type: "directory",
                        name: item,
                        contents: subContents,
                    });
                } else {
                    contents.push({
                        type: "file",
                        name: item,
                        path: itemPath,
                    });
                }
            }

            return contents;
        } catch (err) {
            console.error("Error reading folder contents:", err);
            return [];
        }
    }
    async function readFile(filePath) {
        try {
            let fileContents = await fs.readFile(filePath, "utf8")
            return fileContents;
        } catch (err) {
            console.error("Error reading file: ", err)
            return ""
        }
    }

    async function writeFile(filePath, fileContents) {
        if (filePath != undefined) {
            fs.writeFile(filePath, fileContents)
        }
    }

    async function saveAs(fileName, fileContents) {
        if (fileName) {
            const { canceled, filePath } = await dialog.showSaveDialog({
                defaultPath: fileName,
            });
            writeFile(filePath, fileContents)
        } else {
            const { canceled, filePath } = await dialog.showSaveDialog();
            writeFile(filePath, fileContents)
        }
        win.webContents.send("folderRefresh")
    }

    ipcMain.handle("openFolder", async (event) => {
        return await openFolder();
    });
    ipcMain.handle("folderContents", async (event, folderPath) => {
        return await handleFolderContents(folderPath);
    });
    ipcMain.handle("readFile", async (event, filePath) => {
        return await readFile(filePath);
    });
    ipcMain.handle("writeFile", async (event, filePath, fileContents) => {
        writeFile(filePath, fileContents)
    })
    ipcMain.handle("saveAs", async (event, fileContents, fileName) => {
        return await saveAs(fileContents, fileName);
    });

    // Create a custom menu template
    const menuTemplate = [
        {
            label: app.name,
            submenu: [
                {
                    label: "Quit",
                    accelerator: "CmdOrCtrl+Q",
                    click: () => {
                        app.quit()
                    },
                    role: "quit"
                }
            ]
        },
        {
            label: "File",
            submenu: [
                {
                    label: "New File",
                    accelerator: "CmdOrCtrl+N",
                    click: () => {
                        win.webContents.send("newFile")
                    },
                    role: "newFile"
                },
                {
                    type: "separator"
                },
                {
                    label: "Open Folder",
                    accelerator: "CmdOrCtrl+O",
                    click: () => {
                        openFolder()
                    },
                    role: "openFolder"
                },
                {
                    type: "separator"
                },
                {
                    label: "Save",
                    accelerator: "CmdOrCtrl+S",
                    click: () => {
                        win.webContents.send("saveFile")
                    },
                    role: "save"
                },
                {
                    label: "Save As",
                    accelerator: "CmdOrCtrl+Shift+S",
                    click: () => {
                        win.webContents.send("saveFileAs")
                    },
                    role: "saveAs"
                },
            ]
        },
        {
            label: "Edit",
            submenu: [
                {
                    label: "Undo",
                    accelerator: "CmdOrCtrl+Z",
                    role: "undo"
                },
                {
                    label: "Redo",
                    accelerator: "CmdOrCtrl+Shift+Z",
                    role: "redo"
                },
                {
                    type: "separator"
                },
                {
                    label: "Cut",
                    accelerator: "CmdOrCtrl+X",
                    role: "cut"
                },
                {
                    label: "Copy",
                    accelerator: "CmdOrCtrl+C",
                    role: "copy"
                },
                {
                    label: "Paste",
                    accelerator: "CmdOrCtrl+V",
                    role: "paste"
                },
                {
                    type: "separator"
                },
                {
                    label: "Find",
                    accelerator: "CmdOrCtrl+F",
                    click: () => {
                        win.webContents.send("find")
                    },
                    role: "find"
                },
                {
                    label: "Replace",
                    accelerator: "CmdOrCtrl+H",
                    click: () => {
                        win.webContents.send("find")
                    },
                    role: "replace"
                },
            ]
        }
    ];

    // Set the application menu
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}

app.whenReady().then(() => (createWindow()))

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

try {
    require("electron-reloader")(module);
} catch (_) { }
