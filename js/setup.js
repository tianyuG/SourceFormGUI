// Initial setup for assigning contents on both displays

const remote = require('electron')
const { app, BrowserWindow, shell } = remote
const os = require('os')
const fs = require('electron').remote.require('fs')

let win

function launchAHK() {
	// TODO
}

app.on('ready', () => {
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
  let displays = electron.screen.getAllDisplays()
  const { d0width, d0height } = electron.screen.getPrimaryDisplay().workAreaSize
  let d1 = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })
  const { d1width, d1height } = d1.workAreaSize()
})