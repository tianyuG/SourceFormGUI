const { ipcRenderer, remote } = require('electron')
const OS = require('os')
const fs = require('electron').remote.require('fs')

function getNetworkInterfaceInfo() {
  var netint = OS.networkInterfaces();
  for (i = 0; i < Object.keys(netint).length; i++) {
    var k1 = document.createElement("p");
    var c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(netint)[i]);
    k1.className = "bold_item";
    k1.appendChild(c1);
    document.getElementById("network-info-content").appendChild(k1);
    var k2 = document.createElement("p");
    var c2 = document.createTextNode(JSON.stringify(Object.values(netint)[i]));
    k2.appendChild(c2);
    document.getElementById("network-info-content").appendChild(k2);
  }
}

function getDisplayInfo() {
  var disp = require('electron').remote.getGlobal('displays')
  for (i = 0; i < Object.keys(disp).length; i++) {
    var k1 = document.createElement("p");
    var c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(disp)[i]);
    k1.className = "bold_item";
    k1.appendChild(c1);
    document.getElementById("display-content").appendChild(k1);
    var k2 = document.createElement("p");
    var c2 = document.createTextNode(JSON.stringify(Object.values(disp)[i]));
    k2.appendChild(c2);
    document.getElementById("display-content").appendChild(k2);
  }
}

function getDependencies() {
  // AHK
  ifFileExists("C:\\Program Files\\AutoHotkey\\AutoHotkey.exe", "ahk-installation-status")
}

require('electron').remote.getCurrentWindow().webContents.once('dom-ready', () => {
  getNetworkInterfaceInfo();
  getDisplayInfo();
  getDependencies();
});

function ifFileExists(filepath, elementId) {
  fs.access(filepath, (err) => {
    if (err) {
      document.getElementById(elementId).innerHTML = "Not installed (" + filepath + " doesn't exist): " + err
    } else {
      document.getElementById(elementId).innerHTML = "Installed (found at " + filepath + ")"
    }
  })
}

