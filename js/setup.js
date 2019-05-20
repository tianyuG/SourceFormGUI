// Initial setup for assigning contents on both displays

const { ipcRenderer, remote } = require('electron')
const { app, BrowserWindow, shell } = remote
const os = require('os')
const fs = require('electron').remote.require('fs')

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

  if (require('electron').remote.getGlobal('displays').length == 2) {
    document.getElementById('top-button').disabled = false
    document.getElementById('bottom-button').disabled = false
  } else {
    document.getElementById('top-button').style.display = "none"
    document.getElementById('bottom-button').style.display = "none"
    document.getElementById('screen-selector-warning').innerHTML = "Unsupported display setup (2 required; " + require('electron').remote.getGlobal('displays').length + " detected)."
  }

  const startahkbtn = document.getElementById('start-ahk-button');
  const stopahkbtn = document.getElementById('stop-ahk-button');
  const topbtn = document.getElementById('top-button');
  const btmbtn = document.getElementById('bottom-button');
  const startsourceformbtn = document.getElementById('start-sourceform-button');
  startahkbtn.addEventListener('click', () => {
    ipcRenderer.send('setup-start-ahk-button-clicked')
  });
  stopahkbtn.addEventListener('click', () => {
    ipcRenderer.send('setup-stop-ahk-button-clicked')
  });
  topbtn.addEventListener('click', () => {
    ipcRenderer.send('setup-top-button-clicked')
    document.getElementById('screen-selector-warning').innerHTML = "You have identified this screen to be the top screen."
  });
  btmbtn.addEventListener('click', () => {
    ipcRenderer.send('setup-bottom-button-clicked')
    document.getElementById('screen-selector-warning').innerHTML = "You have identified this screen to be the bottom screen."
  });
  startsourceformbtn.addEventListener('click', () => {
    ipcRenderer.send('setup-start-sourceform-button-clicked')
  });
});