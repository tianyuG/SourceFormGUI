const { app, BrowserWindow, ipcMain } = require('electron')
const url = require('url')
const path = require('path')
const VirtualKeyboard = require('electron-virtual-keyboard')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let win

// function createWindow() {
//   // Create the browser window.
//   win = new BrowserWindow({
//     // height: 1000,
//     webPreferences: {
//       nodeIntegration: true
//     },
//     frame: false,
//     kiosk: true
//   })

//   // and load the index.html of the app.
//   win.loadFile('./html/setup.html')

//   // Open the DevTools.
//   win.webContents.openDevTools()

//   // Set to fullscreen
//   win.setMaximizable(false)
//   win.setMinimizable(false)
//   win.setFullScreenable(false)
//   win.setAlwaysOnTop(true)

//   // Enable virtual keyboard
//   vkb = new VirtualKeyboard(win.webContents);

//   // Emitted when the window is closed.
//   win.on('closed', () => {
//     // Dereference the window object, usually you would store windows
//     // in an array if your app supports multi windows, this is the time
//     // when you should delete the corresponding element.
//     win = null
//   })

// }

const windows = {}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', () => {
  // createWindow();

  // Create main window on the top screen
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