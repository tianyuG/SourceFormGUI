const { app, BrowserWindow, ipcMain, electron } = require('electron')
const url = require('url')
const path = require('path')
const VirtualKeyboard = require('electron-virtual-keyboard')

const windows = {}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', () => {
  console.log("")
  // createWindow();
  if (process.argv.includes('--debugenv')) {
    var timestamp = new Date(Date.now())
    console.log("[DEBUG] format: YYYYMMDD@HH:MM:SS.fff")
    logDebug("Entering debug mode.")
  }

  // Collect information on monitors
  global.displays = require('electron').screen.getAllDisplays()

  // Create main window on the top screen

  if (process.argv.includes('--debugenv')) {
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
    windows.main.webContents.openDevTools()
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
    windows.main.webContents.openDevTools()
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
    windows.main = null
  })

  // Create preview window on the bottom screen.
  if (process.argv.includes('--debugenv')) {
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
    windows.preview.loadFile('./html/setup.html')
    windows.preview.webContents.openDevTools()
  } else {
    windows.preview = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true
      },
      frame: false,
      kiosk: true,
      parent: windows.main,
      show: false
    })
    windows.preview.loadFile('./html/setup.html')
    windows.preview.webContents.openDevTools()
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
  if (typeof(windows.main) != undefined && typeof(windows.preview) != undefined && require('electron').screen.getAllDisplays().length == 2) {
    var mainWindowBounds = windows.main.getBounds()
    var mainDisplay = require('electron').screen.getDisplayNearestPoint({ x: mainWindowBounds.x, y: mainWindowBounds.x })
    var secondaryWindowBounds = windows.preview.getBounds()
    var secondaryDisplay = require('electron').screen.getDisplayNearestPoint({ x: secondaryWindowBounds.x, y: secondaryWindowBounds.x })
    window.main.setBounds(secondaryDisplay.bounds)
    window.preview.setBounds(mainDisplay.bounds)
  }
})

// Format debug log
function logDebug(arg) {
  var timestamp = new Date()
  console.log("[DEBUG:" + timestamp.getFullYear() +
    String(timestamp.getMonth() + 1).padStart(2, '0') +
    String(timestamp.getDate()).padStart(2, '0') + "@" +
    String(timestamp.getHours()).padStart(2, '0') + ":" +
    String(timestamp.getMinutes()).padStart(2, '0') + ":" +
    String(timestamp.getSeconds()).padStart(2, '0') + "." +
    String(timestamp.getMilliseconds()).padStart(3, 0) + "] " + arg)
}