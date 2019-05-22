const { ipcRenderer, remote } = require('electron')
const OS = require('os')

function getNetworkInterfaceInfo() {
  var netint = OS.networkInterfaces();
  for (i = 0; i < Object.keys(netint).length; i++) {
    var k1 = document.createElement("p");
    var c1 = document.createTextNode('#' + (i + 1) + " :" + Object.keys(netint)[i]);
    k1.className = "bold_item";
    k1.appendChild(c1);
    document.getElementById("network-info-content").appendChild(k1);
    var k2 = document.createElement("p");
    var c2 = document.createTextNode(JSON.stringify(Object.values(netint)[i]));
    k2.appendChild(c2);
    document.getElementById("network-info-content").appendChild(k2);
  }
}

require('electron').remote.getCurrentWindow().webContents.once('dom-ready', () => {
  getNetworkInterfaceInfo();
});
