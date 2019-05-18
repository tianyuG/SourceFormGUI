const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const VirtualKeyboard = require('electron-virtual-keyboard')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    // height: 1000,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    kiosk: true
  })

  // and load the index.html of the app.
  win.loadFile('./html/setup.html')

  // Open the DevTools.
  win.webContents.openDevTools()

  // Set to fullscreen
  win.setMaximizable(false)
  win.setMinimizable(false)
  win.setFullScreenable(false)
  win.setAlwaysOnTop(true)

  // Enable virtual keyboard
  vkb = new VirtualKeyboard(win.webContents);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)
app.on('ready', () => {
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.