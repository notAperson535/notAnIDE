const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('quikAPI', {
    // renderer to main.js
    openFolder: () => ipcRenderer.invoke('openFolder'),
    folderContents: (folderPath) => ipcRenderer.invoke('folderContents', folderPath),
    readFile: (filePath) => ipcRenderer.invoke('readFile', filePath),
    writeFile: (filePath, fileContents) => ipcRenderer.invoke('writeFile', filePath, fileContents),
    saveAs: (fileName, fileContents) => ipcRenderer.invoke('saveAs', fileName, fileContents),

    //main.js to renderer

    onFolderRefresh: (callback) => ipcRenderer.on('folderRefresh', () => callback()),

    // file menu
    onNewFile: (callback) => ipcRenderer.on('newFile', () => callback()),
    onOpenFolder: (callback) => ipcRenderer.on('openFolder', (event, folderPath) => callback(folderPath)),
    onSaveFile: (callback) => ipcRenderer.on('saveFile', () => callback()),
    onSaveFileAs: (callback) => ipcRenderer.on('saveFileAs', () => callback()),

    // edit menu
    onFind: (callback) => ipcRenderer.on('find', () => callback()),
})  