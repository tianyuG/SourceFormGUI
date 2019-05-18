// Initial setup for assigning contents on both displays

const remote = require('electron')
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
      var node = document.createElement("p")
      var text = document.createTextNode("AHK is not installed.")
      node.appendChild(text)
      document.getElementById('ahk-installation-status').appendChild(node)
    } else {
      var button = document.createElement("button")
      button.innerHTML = "Launch AHK Script"
      button.onclick = "launchAHK()"
      document.getElementById('ahk-installation-status').appendChild(button)
    }
  })
  let displays = remote.screen.getAllDisplays()
  if (displays.length == 2) {
    const { d0width, d0height } = remote.screen.getPrimaryDisplay().workAreaSize
    let d1 = displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0
    })
    const { d1width, d1height } = d1.screen.getPrimaryDisplay().workAreaSize
  } else {
    var para = document.createElement("p")
    var ptext = document.createTextNode("Unsupported display setup (2 required; detected " + displays.length + " display/displays).")
    para.appendChild(ptext)
    document.getElementById('screen-selector').appendChild(para)
  }
});