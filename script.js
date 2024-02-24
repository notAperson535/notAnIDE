// VARIABLES
let currentFolderPath = ""
let editor = bundle.editor
let state = bundle.state

// IMPORTANT FUNCTIONS
function save() {
    if (currentFolderPath != "") {
        window.quikAPI.writeFile(editor.path, editor.state.doc.toString())
    } else {
        window.quikAPI.saveAs("", editor.state.doc.toString())
    }
}

window.quikAPI.onFolderRefresh(() => {
    openFolder(currentFolderPath)
})

// MENUS

// file menu

window.quikAPI.onOpenFolder((folderPath) => openFolder(folderPath))
window.quikAPI.onNewFile(() => {
    window.quikAPI.saveAs("", "")
})
window.quikAPI.onSaveFile(() => save())
window.quikAPI.onSaveFileAs(() => {
    window.quikAPI.saveAs(editor.fileName, editor.state.doc.toString())
})

// edit menu

window.quikAPI.onFind(() => bundle.openSearchPanel(editor))

// SIDEBAR

function renderFileList(file, parentElement) {
    if (file.type === "directory") {
        let div = document.createElement("div")
        div.classList.add("folderEntry")
        parentElement.appendChild(div)

        let p = document.createElement("p")
        let chevron = document.createElement("img")
        chevron.src = " https://img.icons8.com/ios-glyphs/30/expand-arrow--v1.png"
        p.appendChild(chevron)
        p.innerHTML += file.name
        div.appendChild(p)

        if (file.contents && file.contents.length > 0) {
            let subList = document.createElement("div")
            subList.classList.add("subList")
            div.appendChild(subList)

            file.contents.forEach(subFile => {
                renderFileList(subFile, subList)
            })
        }
    } else if (file.type === "file") {
        let div = document.createElement("div")
        div.classList.add("fileEntry")
        parentElement.appendChild(div)
        div.setAttribute("data-file-path", file.path)

        let p = document.createElement("p")
        p.innerHTML = file.name
        div.appendChild(p)
    }
}

function openFolder(folderPath) {
    currentFolderPath = folderPath
    document.getElementById("fileList").innerHTML = ""

    // grabbing directory files
    folderPath = folderPath.replaceAll("\\", "/")
    let filesDirArray = folderPath.split("/")
    let lastPart = filesDirArray[filesDirArray.length - 1]
    document.getElementById("projectName").innerHTML = lastPart
    let filesPromise = window.quikAPI.folderContents(folderPath)
    filesPromise.then((files) => {
        files = files.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name)
            } else {
                return a.type === "directory" ? -1 : 1
            }
        })
        for (let i = 0; i < files.length; i++) {
            let file = files[i]
            renderFileList(file, document.getElementById("fileList"))
        }

        // folder viewing
        document.querySelectorAll(".folderEntry").forEach(folderEntry => {
            let triggered = false;
            folderEntry.addEventListener("click", e => {
                e.stopPropagation()
                let sublist = folderEntry.querySelector(".subList")
                let chevron = folderEntry.querySelector("p img")
                if (triggered === false) {
                    sublist.style.display = "block";
                    chevron.style.transform = "rotate(0deg)"
                    triggered = true;
                } else {
                    sublist.style.display = "none";
                    chevron.style.transform = "rotate(-90deg)"
                    triggered = false;
                }
            });
        });

        // file opening
        document.querySelectorAll(".fileEntry").forEach(fileEntry => {
            fileEntry.addEventListener("click", e => {
                e.stopPropagation()
                save()
                filePath = fileEntry.getAttribute("data-file-path")
                fileContents = window.quikAPI.readFile(filePath)
                fileContents.then(fileContents => {
                    editor.path = filePath
                    editor.fileName = fileEntry.querySelector("p").innerHTML
                    editor.dispatch({
                        changes: {
                            from: 0,
                            to: editor.state.doc.length,
                            insert: fileContents
                        }
                    })
                    const extension = filePath.split('.').pop();
                    switchLanguageMode(extension)
                })
            })
        })
    })
}

async function switchLanguageMode(extension) {
    if (extension == "quik") {
        editor.dispatch({
            effects: bundle.languageConf.reconfigure(await bundle.quik())
        })
    } else {
        for (let language of bundle.languages) {
            if (language.extensions.includes(extension)) {
                editor.dispatch({
                    effects: bundle.languageConf.reconfigure(await language.load())
                })
                return
            } else {
                editor.dispatch({
                    effects: bundle.languageConf.reconfigure([])
                })
            }
        }
    }
}