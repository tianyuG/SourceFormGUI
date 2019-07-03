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

/*
 * BEGIN: GLOBAL VARIABLES
 */

// Define if the program is run in debug environment (windowed)
global.isInDebugEnv = process.argv.includes('--debugenv')

// Define if the program is run in debug environment (fullscreen)
global.isInFullscreenDebugEnv = process.argv.includes('--fdebugenv')
/*
 * END: GLOBAL VARIABLES
 */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', () => {
	console.log("")

	// GLOABL variable for display information
	global.displays = require('electron')
		.screen.getAllDisplays()

	if (isInDebugEnv) {
		var timestamp = new Date(Date.now())
		console.log("[DEBUG] format: YYYYMMDD@HH:MM:SS.fff")
		logDebug("Entering debug mode.")
	}

	// Create main window on the top screen

	if (isInDebugEnv) {
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
		loadGlobalVariables()
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
		loadGlobalVariables()
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
			parent: windows.main,
			show: false
		})
		windows.preview.loadFile('./html/preview-idle.html')
		windows.main.webContents.closeDevTools()
	} else {
		if (isInFullscreenDebugEnv) {
			isInDebugEnv = true
		} // End of window creation process
		windows.preview = new BrowserWindow({
			webPreferences: {
				nodeIntegration: true
			},
			frame: false,
			kiosk: true,
			parent: windows.main,
			show: false
		})
		windows.preview.loadFile('./html/preview-idle.html')
		windows.main.webContents.closeDevTools()
		windows.preview.setMaximizable(false)
		windows.preview.setMinimizable(false)
		windows.preview.setFullScreenable(false)
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
		show: false
	})
	// windows.workerDownload.webContents.openDevTools()
	windows.workerDownloadHelper = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		show: false
	})
	// windows.workerDownloadHelper.webContents.openDevTools()
	windows.workerPly2stl =
		new BrowserWindow({
			webPreferences: {
				nodeIntegration: true
			},
			show: false
		})
	windows.workerStl2bmp = new BrowserWindow({
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
	windows.workerDownload.loadFile('./html/worker-download.html')
	windows.workerDownloadHelper.loadFile('./html/worker-downloadhelper.html')
	windows.workerPly2stl.loadFile('./html/worker-ply2stl.html')
	windows.workerStl2bmp.loadFile('./html/worker-stl2bmp.html')
	windows.workerPrinting.loadFile('./html/worker-printing.html')

	// windows.workerDownload.on('closed', () => {
	//     windows.workerdownload = null
	// })
	// 
	// 
	// 
	ipcMain.on('image-download-request', function(event, data) {
		// console.log(data)
		const dlDir = data.properties.directory
		const dlUrlArr = data.url
		const CancelToken = axios.CancelToken
		const source = []
		fs.writeFile(path.resolve(dlDir, "./dlLog.txt"), "LOG\n")
			.catch((err) => {
				logDebug("[MAIN] log saving failed: " + err)
			})
		for (var i = 0; i < dlUrlArr.length; i++) {
			source[i] = CancelToken.source()
		}

		for (var u in dlUrlArr) {
			axios({
					method: 'get',
					url: dlUrlArr[u],
					responseType: 'arraybuffer',
					cancelToken: source[u].token,
					timeout: 15000
				})
				.then((res) => {
					logDebug("[MAIN] Writing image #" + u + ": " + dlUrlArr[u])
					fs.writeFile(path.resolve(dlDir, "./" + path.basename(res.config.url)), res.data)
						.catch((err) => {
							fs.appendFile(path.resolve(dlDir, "./dlLog.txt"), "[MAIN] image #" + u + " (" + dlUrlArr[u] + ") save failed (fsWrite): " + err.code + ": " + err.message + "\n")
								.catch((err) => {
									logDebug("[MAIN] log saving failed: " + err)
								})
							logDebug("[MAIN] image save failed: " + err)
						})
				})
				.catch((err) => {
					fs.appendFile(path.resolve(dlDir, "./dlLog.txt"), "[MAIN] image #" + u + " (" + dlUrlArr[u] + ") save failed (axios): " + err.code + ": " + err.message + "\n")
						.catch((err) => {
							logDebug("[MAIN] log saving failed: " + err)
						})
					logDebug("[MAIN] AXIOS download failed: " + err)
				})
		}
	})
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	app.quit()
})

// Run AHK script on demand
ipcMain.on('start-ahk-button-clicked', (evt, arg) => {
	app.quit()
})

// Swap monitors on demand
ipcMain.on('swap-displays', (evt, arg) => {
	// console.log(windows.main.getBounds().x)
	// console.log(typeof windows)

	// Make sure there are two windows and two monitors
	if (typeof(windows.main) != undefined && typeof(windows.preview) != undefined && require('electron')
		.screen.getAllDisplays()
		.length == 2) {
		var mainWindowBounds = windows.main.getBounds()
		var mainDisplay = require('electron')
			.screen.getDisplayNearestPoint({
				x: mainWindowBounds.x,
				y: mainWindowBounds.x
			})
		var secondaryWindowBounds = windows.preview.getBounds()
		var secondaryDisplay = require('electron')
			.screen.getDisplayNearestPoint({
				x: secondaryWindowBounds.x,
				y: secondaryWindowBounds.x
			})
		window.main.setBounds(secondaryDisplay.bounds)
		window.preview.setBounds(mainDisplay.bounds)
	}
})

// Format debug log
const logDebug = (arg) => {
	var timestamp = new Date()
	if (isInDebugEnv) {
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
	}
}

/*
 * Loading global settings/variables from disk.
 * Use remote.getGlobal() to fetch a single global variable.
 */
const loadGlobalVariables = async () => {
	var gvPath = "../configs/globalvariables.json"
	var gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

	for (var e in gvObj) {
		logDebug(JSON.stringify(e) + ": " + JSON.stringify(gvObj[e]))
		global[e] = gvObj[e]
	}
}

/*
 * Set the global variable with given key-value pair.
 * Use ipcRenderer.send("set-globalvariable", [key, value]) 
 * to modify existing global variable.
 */
const setGlobalVariable = async (k, v) => {
	var gvPath = "../configs/globalvariables.json"
	var gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

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

const setGlobalVariablePath = async (k, v) => {
	var gvPath = "../configs/globalvariables.json"
	var gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

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

/*
 * Relaying search query to preview window
 */
ipcMain.on('search-committed', function(event, data) {
	windows.main.loadFile('./html/searchpreview.html')
	windows.main.webContents.once('dom-ready', () => {
		windows.main.webContents.send('search-query-relay', data);
	})
});

/*
 * Moving from preview back to main screen
 */
ipcMain.on('preview-aborted', function(event, data) {
	windows.main.loadFile('./html/index.html')
	windows.main.webContents.once('dom-ready', () => {
		windows.main.webContents.send('select-all-input', data);
	})
});

/*
 * Set global variable then write to disk
 * !!!: This function is not responsible for sanitisation input!
 */

ipcMain.on('set-globalvariable', function(event, data) {
	var gvK = data[0]
	var gvV = data[1]
	setGlobalVariable(gvK, gvV)
});

ipcMain.on('set-globalvariablepath', function(event, data) {
	var gvK = data[0]
	var gvV = data[1]
	if (gvV != null) {
		setGlobalVariablePath(gvK, gvV)
	}
});

/*
 * Load setup window upon request
 */
ipcMain.on('load-setup-window', function(event, data) {
	windows.preview.loadFile('./html/setup.html')
})

ipcMain.on('open-diagnostics', function(event, data) {
	windows.preview.loadFile('./html/diagnostics.html')
})

ipcMain.on('ld-main', function(event, data) {
	logDebug(data)
})

ipcMain.on('worker-download-search-r', function(event, data) {
	logDebug("DELEGATING " + data)
	windows.workerDownloadHelper.send('worker-download-search', data)
})