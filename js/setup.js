// Initial setup for assigning contents on both displays

const { ipcRenderer, remote } = require('electron')
const { app, BrowserWindow, shell, dialog } = remote
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

  const imagepathcurr = document.getElementById('imagepath-current');
  const imagepathbtn = document.getElementById('imagepath-button');
  const remoteipcurr = document.getElementById('remoteip-current');
  const remoteipbtn = document.getElementById('remoteip-button');
  const remoteipinput = document.getElementById('remoteip-input')
  const remoteipbtncnfm = document.getElementById('remoteip-button-confirm');
  const remoteipwarning = document.getElementById('remoteip-warning');

  // imagepathcurr.innerHTML = require('electron').remote.getGlobal('imagePath')
  imagepathcurr.innerHTML = "TEST"
  remoteipcurr.innerHTML = require('electron').remote.getGlobal('remoteIP')

  imagepathbtn.addEventListener('click', () => {
    var imgpath = dialog.showOpenDialog({ properties: ['openDirectory'] })
    ipcRenderer.send("set-imagepath", imgpath)
    imagepathcurr.innerHTML = require('electron').remote.getGlobal('imagePath')
  });

  remoteipbtn.addEventListener('click', () => {
    remoteipinput.style.display = "inline"
    remoteipbtn.style.display = "none"
    remoteipbtncnfm.style.display = "inline"
    // ipcRenderer.send("set-imagepath", imgpath)
    // imagepathcurr.innerHTML = require('electron').remote.getGlobal('imagePath')
  });

  remoteipbtncnfm.addEventListener('click', () => {
    const isIp = require('is-ip');
    if (remoteipinput.value.trim() == "") {
      remoteipinput.style.display = "none"
      remoteipbtn.style.display = "inline"
      remoteipbtncnfm.style.display = "none"
    } else if (!isIp(remoteipinput.value)) {
      remoteipwarning.style.display = "block"
      remoteipinput.style.color = "orange"
    } else  {
      remoteipwarning.style.display = "none"
      remoteipinput.style.color = "black"
      remoteipinput.style.display = "none"
      remoteipbtn.style.display = "inline"
      remoteipbtncnfm.style.display = "none"
      ipcRenderer.send("set-remoteip", remoteipinput.value)
      remoteipcurr.innerHTML = require('electron').remote.getGlobal('remoteIP')
    }
  });

  remoteipinput.addEventListener("keyup", () => {
    if (event.keyCode == 13) {
      remoteipbtncnfm.click()
    }
  })
});