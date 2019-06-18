const {
		app,
		BrowserWindow,
		ipcMain,
		electron,
		dialog
} = require('electron')
const url = require('url')
const path = require('path')
const VirtualKeyboard = require('electron-virtual-keyboard')

const windows = {}

/*
 * BEGIN: GLOBAL VARIABLES
 */

// Define if the program is run in debug environment (windowed)
global.isInDebugEnv           = process.argv.includes('--debugenv')

// Define if the program is run in debug environment (fullscreen)
global.isInFullscreenDebugEnv = process.argv.includes('--fdebugenv')

// Define Flickr API key and secret
global.flickrKey              = "d8961cd658655c19ee5ae158b9a191dc"
global.flickrSecret           = "b9eb42d1426b41f2"
global.flickrKey_default      = "d8961cd658655c19ee5ae158b9a191dc"
global.flickrSecret_default   = "b9eb42d1426b41f2"

// Define where the downloaded images are
global.imagePath              = ""

// Define where the script for converting PLY point cloud to STL model is
global.PLY2STLScriptPath      = ""

// Define where the script for converting STL model to BMP bitmap is
global.STL2BMPScriptPath      = ""

// Define where the Arduino script for controlling the printer is
global.printerScriptPath      = ""

// Define number of images to be downloaded per model
global.numberOfImagesPerModel = 500

// Define the IP address for the modelling computer
global.remoteIP               = "192.168.1.10"

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
		windows.workerPly2stl = new BrowserWindow({
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
		windows.workerPly2stl.loadFile('./html/worker-ply2stl.html')
		windows.workerStl2bmp.loadFile('./html/worker-stl2bmp.html')
		windows.workerPrinting.loadFile('./html/worker-printing.html')

		// windows.workerDownload.on('closed', () => {
		//     windows.workerdownload = null
		// })
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
function logDebug(arg) {
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
 * Relaying search query to preview window
 */
ipcMain.on('search-committed', function(event, data) {
		windows.main.loadFile('./html/searchpreview.html')
		logDebug("SEND " + data)
		windows.main.webContents.once('dom-ready', () => {
				windows.main.webContents.send('search-query-relay', data);
		})
});

/*
 * Moving from preview back to main screen
 */
ipcMain.on('preview-aborted', function(event, data) {
		windows.main.loadFile('./html/index.html')
		// logDebug("SEND " + data)
		windows.main.webContents.once('dom-ready', () => {
				windows.main.webContents.send('select-all-input', data);
		})
});

ipcMain.on('set-flickrkey', function(event, data) {
	logDebug("SETFKEY")
		flickrKey = data;
});

ipcMain.on('set-flickrsecret', function(event, data) {
		flickrSecret = data;
});

ipcMain.on('reset-flickrkey', function(event, data) {
		flickrKey = flickrKey_default;
});

ipcMain.on('reset-flickrsecret', function(event, data) {
		flickrSecret = flickrSecret_default;
});

/*
 * Change imagePath global variiable
 */
ipcMain.on('set-imagepath', function(event, data) {
		imagePath = data;
});

/*
 * Change PLY2STLScriptPath global variiable
 */
ipcMain.on('set-ply2stlscriptpath', function(event, data) {
		PLY2STLScriptPath = data;
});

/*
 * Change STL2BMPScriptPath global variiable
 */
ipcMain.on('set-stl2bmpscriptpath', function(event, data) {
		STL2BMPScriptPath = data;
});

/*
 * Change printerScriptPath global variiable
 */
ipcMain.on('set-printerscriptpath', function(event, data) {
		printerScriptPath = data;
});

ipcMain.on('set-numofimgs', function(event, data) {
		numberOfImagesPerModel = parseInt(data, 10);
});

/*
 * Change remoteIP global variiable
 */
ipcMain.on('set-remoteip', function(event, data) {
		remoteIP = data;
});



/*
 * Load setup window upon request
 */
ipcMain.on('load-setup-window', function(event, data) {
		windows.preview.loadFile('./html/setup.html')
})