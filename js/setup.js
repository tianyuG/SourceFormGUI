// Initial setup for assigning contents on both displays

const remote = require('electron')
const { app, BrowserWindow, shell } = remote
const os = require('os')
const fs = require('electron').remote.require('fs')
const { ipcMain } = require('electron')

let win

function launchAHK() {
  // TODO
}

require('electron').remote.getCurrentWindow().webContents.once('dom-ready', () => {
  fs.access(`C:\\Program Files\\AutoHotkey\\AutoHotkey.exe`, (err) => {
    if (err) {
      document.getElementById('start-ahk-button').style.display = "none"
      document.getElementById('stop-ahk-button').style.display = "none"
      document.getElementById('ahk-installation-status-warning').innerHTML = "AHK is not installed."
    }
  })
  let displays = remote.screen.getAllDisplays()
  if (displays.length == 2) {
    const { d0width, d0height } = remote.screen.getPrimaryDisplay().workAreaSize
    let d1 = displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0
    })
    const { d1width, d1height } = d1.workAreaSize

    document.getElementById('top-button').disabled = false
    document.getElementById('bottom-button').disabled = false
  } else {
    document.getElementById('top-button').style.display = "none"
    document.getElementById('bottom-button').style.display = "none"
    document.getElementById('screen-selector-warning').innerHTML = "Unsupported display setup (2 required; detected " + displays.length + " display/displays)."
  }
});