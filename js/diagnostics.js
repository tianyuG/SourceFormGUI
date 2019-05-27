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

require('electron').remote.getCurrentWindow().webContents.once('dom-ready', () => {
  getNetworkInterfaceInfo();
  getDisplayInfo();
});

async function ifFileExists(filepath, elementId) {
  fs.access(filepath, (err) => {
    if (err) {
      document.getElementById(elementId).innerHTML = "Not installed (" + filepath + " doesn't exist): " + err
    } else {
      document.getElementById(elementId).innerHTML = "Installed (found at " + filepath + ")"
    }
  })
}

// Concatenate string (array) `arr` with string `ch`
// If `arr` is a string array with two or more elements, combine each of the 
// elements with `ch` in between. If `arr` is a string or a stirng array with 
// one element, returns `arr`
// EXAMPLE
// concatWith(["1", "2", "3"], ", ") // Returns "1, 2, 3"
// concatWith("1", ", ") // Returns "1"
// concatWith(["1"], ", ") // Returns "1"

function concatWith(arr, ch) {
  ret = ""

  if (Array.isArray(arr)) {
    for (var i = 0; i < arr.length; i++) {
      ret += arr
      if (i < arr.length - 1) { ret += ch }
    }
} else { ret = arr }

  return ret
}
