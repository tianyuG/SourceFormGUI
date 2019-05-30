const { ipcRenderer, remote } = require('electron')
const OS = require('os')
const fs = require('electron').remote.require('fs')

function getNetworkInterfaceInfo() {
  var netint = OS.networkInterfaces();
  for (i = 0; i < Object.keys(netint).length; i++) {
    var k1 = document.createElement("p");
    var c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(netint)[i]);
    k1.className = "bold-item";
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
    k1.className = "bold-item";
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
  // Use `/` instead of `\\` in filepath, even in Windows!
  // `\\` is reserved for escape character in glob.
  ifFileExists("C:/Program Files/AutoHotkey/AutoHotkey.exe", "ahk-installation-status", "AHK", "https://www.autohotkey.com/")
  ifFileExists("C:/Program Files/ImageMagick-*/magick.exe", "imagemagick-installation-status", "imagemagick", "https://imagemagick.org/script/download.php#windows")
  ifFileExists("C:/Python27/python.exe", "python27-installation-status", "python 2.7", "https://www.python.org/downloads/")
}

require('electron').remote.getCurrentWindow().webContents.once('dom-ready', () => {
  getNetworkInterfaceInfo();
  getDisplayInfo();
  getDependencies();
});

// Use `/` instead of `\\` in filepath, even in Windows!
// `\\` is reserved for escape character in glob.
function ifFileExists(filepath, elementId, appName, appUrl, errorMsg = null) {
  var glob = require("glob")
  glob(filepath, function(err, files) {
    if (files.length < 1) {
      if (errorMsg != null) {
        document.getElementById(elementId).innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>." + "<br />" + errorMsg + "</p>"
      } else {
        document.getElementById(elementId).innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>.</p>"
      }
    } else if (err) {
      if (errorMsg != null) {
        document.getElementById(elementId).innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />error message: " + err + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>." + "<br />" + errorMsg + "</p>"
      } else {
        document.getElementById(elementId).innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />error message: " + err + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>.</p>"
      }
    } else {
      document.getElementById(elementId).innerHTML = "Installed (found at " + concatWith(files, ", ") + ")"
    }
  })
}