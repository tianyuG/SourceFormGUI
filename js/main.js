const {
    app,
    BrowserWindow,
    ipcMain,
    electron,
    dialog
} = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')
    .promises
const VirtualKeyboard = require('electron-virtual-keyboard')
const {
    download
} = require('electron-dl')
const axios = require('axios')

const windows = {}
const gvPath = "../configs/globalvariables.json"

/*
 * BEGIN: GLOBAL VARIABLES
 */

// Define if the program is run in debug environment (windowed)
global.isInDebugEnv = process.argv.includes('--debugenv')

// Define if the program is run on a low res monitor
global.isLowRes = process.argv.includes('--lres')

// List of current jobs
// Format: [['name', 'stage']]
global.jobs = []
/*
 * END: GLOBAL VARIABLES
 */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', async () => {
    console.log("")

    // GLOABL variable for display information
    global.displays = require('electron')
        .screen.getAllDisplays()
    await loadGlobalVariables()


    // Create main window on the top screen

    if (isInDebugEnv) {
        var timestamp = new Date(Date.now())
        console.log("[DEBUG] format: YYYYMMDD@HH:MM:SS.fff")
        logDebug("Entering debug mode.")
        logDebug("Kiosk mode will be disabled (main screen).")

        windows.main = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            // frame: false,
            // kiosk: true,
            width: 1100,
            height: 520,
            x: 800,
            y: 0,
            show: false
        })
        windows.main.loadFile('./html/index.html')
        windows.main.webContents.closeDevTools()
        windows.main.setBackgroundColor("#000")
    } else {
        windows.main = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            frame: false,
            kiosk: true,
            show: false
        })
        windows.main.loadFile('./html/index.html')
        windows.main.webContents.closeDevTools()
        windows.main.setMaximizable(false)
        windows.main.setMinimizable(false)
        windows.main.setFullScreenable(false)
        windows.main.setAlwaysOnTop(true)
        windows.main.setBackgroundColor("#000")
    }

    vkb = new VirtualKeyboard(windows.main.webContents)

    windows.main.on('ready-to-show', () => {
        // Show window when everything is fully loaded.
        // !!!: This may or may not cause issues later on...
        windows.main.show()
    })

    windows.main.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // windows.main = null
        // windows.preview = null
        // windows.workerdownload = null
        app.quit()
    })

    // Create preview window on the bottom screen.
    if (isInDebugEnv) {
        logDebug("Kiosk mode will be disabled (preview screen).")

        windows.preview = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            // frame: false,
            // kiosk: true,
            width: 1100,
            height: 520,
            x: 800,
            y: 520,
            // parent: windows.main,
            show: false
        })
        windows.preview.loadFile('./html/preview-idle.html')
        windows.preview.webContents.closeDevTools()
        windows.preview.setBackgroundColor("#000")
    } else {
        windows.preview = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            frame: false,
            // kiosk: true,
            // parent: windows.main,
            show: false
        })
        windows.preview.loadFile('./html/preview-idle.html')
        windows.preview.webContents.closeDevTools()
        windows.preview.setMaximizable(false)
        windows.preview.setMinimizable(false)
        windows.preview.setFullScreenable(false)
        windows.preview.setBackgroundColor("#000")
        // windows.preview.setAlwaysOnTop(true)
    }

    windows.preview.on('ready-to-show', () => {
        windows.preview.show()
    })

    windows.preview.on('closed', () => {
        windows.preview = null
    })

    windows.workerDownload = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        // show: true
        show: false
    })
    // windows.workerDownload.webContents.openDevTools()
    windows.workerDownloadHelper = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        // show: true
        show: false
    })
    // windows.workerDownloadHelper.webContents.openDevTools()
    windows.workerModelling =
        new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            show: false
        })
    windows.workerModellingHelper = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    })
    windows.workerPrinting = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    })
    windows.workerPrintingHelper = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    })
    windows.workerDownload.loadFile('./html/worker-download.html')
    windows.workerDownloadHelper.loadFile('./html/worker-downloadhelper.html')
    windows.workerModelling.loadFile('./html/worker-modelling.html')
    windows.workerModellingHelper.loadFile('./html/worker-modellinghelper.html')
    windows.workerPrinting.loadFile('./html/worker-printing.html')
    windows.workerPrintingHelper.loadFile('./html/worker-printinghelper.html')

    // Align windows with the displays
    if (global.displayMain != null && global.displayPreview != null) {
        logDebug("[MAIN] Predefined display param. Setting bounds.")
        logDebug("[MAIN] Main Window: " + JSON.stringify(windows.main.getBounds()))
        logDebug("[MAIN] Preview Window: " + JSON.stringify(windows.preview.getBounds()))
        for (let iD in global.displays) {
            if (global.displays[iD].id == global.displayMain) {
                logDebug("[MAIN] Setting Main Window: " + JSON.stringify(global.displays[iD].bounds))
                windows.main.setBounds(global.displays[iD].bounds)
            }
            if (global.displays[iD].id == global.displayPreview) {
                logDebug("[MAIN] Setting Preview Window: " + JSON.stringify(global.displays[iD].bounds))
                // windows.preview.setFrame(true)
                windows.preview.setBounds(global.displays[iD].bounds)
            }
        }
        logDebug("[MAIN] New Main Window: " + JSON.stringify(windows.main.getBounds()))
        logDebug("[MAIN] New Preview Window: " + JSON.stringify(windows.preview.getBounds()))
    }

    // When image download is requested by downloadhelper
    ipcMain.on('image-download-request', function(event, data) {
        // console.log(data)
        const dlDir = data.properties.directory
        const dlUrlArr = data.url
        const CancelToken = axios.CancelToken
        let dlTimeout = 15000
        if (global.downloadTimeout != null && global.downloadTimeout >= 5000) {
            dlTimeout = global.downloadTimeout
        }
        const source = []
        const promises = []
        fs.writeFile(path.resolve(dlDir, "./dlLog.txt"), "ERROR-LOG\n")
            .catch((err) => {
                logDebug("[MAIN] log saving failed: " + err)
            })
        for (let i = 0; i < dlUrlArr.length; i++) {
            source[i] = CancelToken.source()
        }

        for (let u in dlUrlArr) {
            promises.push(new Promise((resolve, reject) => {
                axios({
                        method: 'get',
                        url: dlUrlArr[u],
                        responseType: 'arraybuffer',
                        cancelToken: source[u].token,
                        timeout: dlTimeout
                    })
                    .then((res) => {
                        // TODO: Announce image downloaded
                        // logDebug("[MAIN] Writing image #" + u + ": " + dlUrlArr[u])
                        fs.writeFile(path.resolve(dlDir, "./" + path.basename(res.config.url)), res.data)
                            .catch((err) => {
                                fs.appendFile(path.resolve(dlDir, "./dlLog.txt"), "[MAIN] image #" + u + " (" + dlUrlArr[u] + ") save failed (fsWrite): " + err.code + ": " + err.message + "\n")
                                    .catch((err) => {
                                        logDebug("[MAIN] log saving failed: " + err)
                                    })
                                logDebug("[MAIN] image save failed: " + err)
                            })
                        resolve()
                    })
                    .catch((err) => {
                        // TODO: Announce image download failed
                        fs.appendFile(path.resolve(dlDir, "./dlLog.txt"), "[MAIN] image #" + u + " (" + dlUrlArr[u] + ") save failed (axios): " + err.code + ": " + err.message + "\n")
                            .catch((err) => {
                                logDebug("[MAIN] log saving failed: " + err)
                            })
                        logDebug("[MAIN] image #" + u + "(" + dlUrlArr[u] + ") save failed (axios): " + err.code + ": " + err.message)
                        resolve()
                    })
            }))
        }

        Promise.all(promises)
            .then(() => {

                // TODO: SIGNAL DOWNLOAD COMPLETE
                logDebug("!!!!! TESTTESTTESTTESTTEST !!!!!")
                logDebug("!!!!! TESTTESTTESTTESTTEST !!!!!")
                logDebug("!!!!! TESTTESTTESTTESTTEST !!!!!")
                logDebug("!!!!! TESTTESTTESTTESTTEST !!!!!")

                windows.workerDownloadHelper.send('worker-download-image-complete', dlDir)
            })
    })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
})

/*
 *
 * IPC CALLS
 * 
 */

// Run AHK script on demand
ipcMain.on('start-ahk-button-clicked', (evt, arg) => {
    app.quit()
})

// Swap monitors on demand
// TODO: There will be three uisplays: one more for the 
// printer's projector... Need to factor that in
ipcMain.on('swap-displays', (evt, arg) => {

    // Make sure there are two windows and two monitors
    // if (typeof(windows.main) != undefined && typeof(windows.preview) != undefined && require('electron')
    // 	.screen.getAllDisplays()
    // 	.length == 2) {
    // 	let mainWindowBounds = windows.main.getBounds()
    // 	let mainDisplay = require('electron')
    // 		.screen.getDisplayNearestPoint({
    // 			x: mainWindowBounds.x,
    // 			y: mainWindowBounds.x
    // 		})
    // 	let secondaryWindowBounds = windows.preview.getBounds()
    // 	let secondaryDisplay = require('electron')
    // 		.screen.getDisplayNearestPoint({
    // 			x: secondaryWindowBounds.x,
    // 			y: secondaryWindowBounds.x
    // 		})
    // 	window.main.setBounds(secondaryDisplay.bounds)
    // 	window.preview.setBounds(mainDisplay.bounds)
    // }
    if (typeof(windows.main) != undefined && typeof(windows.preview) != undefined) {
        let allDisp = require('electron').screen.getAllDisplays()
        if (allDisp.length == 2) {
            let mainWindowBounds = windows.main.getBounds()
            let mainDisplay = require('electron')
                .screen.getDisplayNearestPoint({
                    x: mainWindowBounds.x,
                    y: mainWindowBounds.y
                })
            let secondaryWindowBounds = windows.preview.getBounds()
            let secondaryDisplay = require('electron')
                .screen.getDisplayNearestPoint({
                    x: secondaryWindowBounds.x,
                    y: secondaryWindowBounds.y
                })
            window.main.setBounds(secondaryDisplay.bounds)
            window.preview.setBounds(mainDisplay.bounds)
        }
    }
})

/*
 * Relaying search query to preview window
 */
ipcMain.on('search-committed', (event, data) => {
    windows.main.loadFile('./html/searchpreview.html')
    windows.main.webContents.once('dom-ready', () => {
        windows.main.webContents.send('search-query-relay', data);
    })
});

/*
 * Moving from preview back to main screen
 */
ipcMain.on('preview-aborted', (event, data) => {
    windows.main.loadFile('./html/index.html')
    windows.main.webContents.once('dom-ready', () => {
        windows.main.webContents.send('select-all-input', data);
        windows.main.webContents.send('centre-keyboard');
    })
});

/*
 * Moving from preview back to main screen
 */
ipcMain.on('preview-cancelled', (event, data) => {
    windows.main.loadFile('./html/index.html')
    windows.main.webContents.once('dom-ready', () => {
        windows.main.webContents.send('centre-keyboard');
    })
});

/*
 * Set global variable then write to disk
 * !!!: This function is not responsible for sanitisation input!
 */

ipcMain.on('set-globalvariable', (event, data) => {
    let gvK = data[0]
    let gvV = data[1]
    setGlobalVariable(gvK, gvV)
});

ipcMain.on('set-globalvariableint', (event, data) => {
    let gvK = data[0]
    let gvV = data[1]
    setGlobalVariableInt(gvK, gvV)
});

ipcMain.on('set-globalvariablepath', (event, data) => {
    let gvK = data[0]
    let gvV = data[1]
    if (gvV != null) {
        setGlobalVariablePath(gvK, gvV)
    }
});

/*
 * Load setup window upon request
 */

ipcMain.on('open-diagnostics', (event, data) => {
    windows.preview.loadFile('./html/diagnostics.html')
})

ipcMain.on('open-diagnostics-main', (event, data) => {
    windows.main.loadFile('./html/diagnostics.html')
})

ipcMain.on('open-setup', (event, data) => {
    windows.preview.loadFile('./html/setup.html')
})

ipcMain.on('open-setup-main', (event, data) => {
    windows.main.loadFile('./html/setup.html')
})

ipcMain.on('quit-app', (event, data) => {
    app.quit()
})

ipcMain.on('open-devtools', (event, data) => {
    windows.preview.webContents.toggleDevTools()
})

ipcMain.on('open-devtools-main', (event, data) => {
    windows.main.webContents.toggleDevTools()
})

/*
 * Allow other renderers to write to terminal for debugging
 */
ipcMain.on('ld-main', (event, data) => {
    logDebug(data)
})

ipcMain.on('worker-download-search-r', (event, data) => {
    logDebug("[MAIN] delegating image download: " + data)
    windows.workerDownloadHelper.send('worker-download-search', data)
    // windows.main.send("search-complete-relay", data)
    windows.main.loadFile("./html/searchcomplete.html")
    // windows.main.webContents.openDevTools()
    windows.main.webContents.once('dom-ready', () => {
        windows.main.webContents.send('search-complete-relay', data);
    })
})

ipcMain.on('worker-modelling-request-r', (event, data) => {
    logDebug("[MAIN] delegating modelling request: " + data)
    windows.workerModellingHelper.send('worker-modelling-request', data)
})

ipcMain.on('worker-printing-request-r', (event, data) => {
    logDebug("[MAIN] delegating printing request: " + data)
    windows.workerPrintingHelper.send('worker-printing-request', data)
})

/*
 *
 * FUNCTIONS
 * 
 */

// Format debug log
const logDebug = (arg) => {
    let timestamp = new Date()
    // if (isInDebugEnv) {
    console.log("[DEBUG:" + timestamp.getFullYear() +
        String(timestamp.getMonth() + 1)
        .padStart(2, '0') +
        String(timestamp.getDate())
        .padStart(2, '0') + "@" +
        String(timestamp.getHours())
        .padStart(2, '0') + ":" +
        String(timestamp.getMinutes())
        .padStart(2, '0') + ":" +
        String(timestamp.getSeconds())
        .padStart(2, '0') + "." +
        String(timestamp.getMilliseconds())
        .padStart(3, 0) + "] " + arg)
    // }
}

/*
 * Loading global settings/variables from disk.
 * Use remote.getGlobal() to fetch a single global variable.
 */
const loadGlobalVariables = async () => {
    let gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

    for (let e in gvObj) {
        // logDebug(JSON.stringify(e) + ": " + JSON.stringify(gvObj[e]))
        global[e] = gvObj[e]
    }
}

/*
 * Set the global variable with given key-value pair.
 * Use ipcRenderer.send("set-globalvariable", [key, value]) 
 * to modify existing global variable.
 */
const setGlobalVariable = async (k, v) => {
    let gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

    if (gvObj.hasOwnProperty(k)) {
        global[k] = v
        gvObj[k] = v
        fs.writeFile(path.resolve(__dirname, gvPath), JSON.stringify(gvObj, null, 2), (err) => {
            if (err) {
                logDebug("[MAIN] failed to write global variable to disk: " + err)
            }
        });
    }
}

const setGlobalVariableInt = async (k, v) => {
    let gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

    if (gvObj.hasOwnProperty(k)) {
        global[k] = parseInt(v, 10)
        gvObj[k] = parseInt(v, 10)
        fs.writeFile(path.resolve(__dirname, gvPath), JSON.stringify(gvObj, null, 2), (err) => {
            if (err) {
                logDebug("[MAIN] failed to write global variable to disk: " + err)
            }
        });
    }
}

const setGlobalVariablePath = async (k, v) => {
    let gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

    if (gvObj.hasOwnProperty(k)) {
        global[k] = v[0]
        gvObj[k] = v[0]
        fs.writeFile(path.resolve(__dirname, gvPath), JSON.stringify(gvObj, null, 2), (err) => {
            if (err) {
                logDebug("[MAIN] failed to write global variable to disk: " + err)
            }
        });
    }
}