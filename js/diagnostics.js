const {
	ipcRenderer,
	remote
} = require('electron')
const OS = require('os')
const path = require('path')
const fs = require('graceful-fs')
const cproc = require('child_process')

function getNetworkInterfaceInfo() {
	var netint = OS.networkInterfaces();
	for (i = 0; i < Object.keys(netint)
		.length; i++) {
		var k1 = document.createElement("p");
		var c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(netint)[i]);
		k1.className = "bold-item";
		k1.appendChild(c1);
		document.getElementById("network-info-content")
			.appendChild(k1);
		var k2 = document.createElement("p");
		var c2 = document.createTextNode(JSON.stringify(Object.values(netint)[i]));
		k2.appendChild(c2);
		document.getElementById("network-info-content")
			.appendChild(k2);
	}
}

function getDisplayInfo() {
	var disp = require('electron')
		.remote.getGlobal('displays')
	for (i = 0; i < Object.keys(disp)
		.length; i++) {
		var k1 = document.createElement("p");
		var c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(disp)[i]);
		k1.className = "bold-item";
		k1.appendChild(c1);
		document.getElementById("display-content")
			.appendChild(k1);
		var k2 = document.createElement("p");
		var c2 = document.createTextNode(JSON.stringify(Object.values(disp)[i]));
		k2.appendChild(c2);
		document.getElementById("display-content")
			.appendChild(k2);
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

require('electron')
	.remote.getCurrentWindow()
	.webContents.once('dom-ready', () => {
		getNetworkInterfaceInfo();
		getDisplayInfo();
		getDependencies();
		getPlatform();
		getGlobalVariablesCount();
		getGlobalVariables();
	});

// Use `/` instead of `\\` in filepath, even in Windows!
// `\\` is reserved for escape character in glob.
function ifFileExists(filepath, elementId, appName, appUrl, errorMsg = null) {
	var glob = require("glob")
	glob(filepath, function(err, files) {
		if (files.length < 1) {
			if (errorMsg != null) {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>." + "<br />" + errorMsg + "</p>"
			} else {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>.</p>"
			}
		} else if (err) {
			if (errorMsg != null) {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />error message: " + err + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>." + "<br />" + errorMsg + "</p>"
			} else {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"err-msg italic-item\">search path: " + filepath + "<br />error message: " + err + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>.</p>"
			}
		} else {
			document.getElementById(elementId)
				.innerHTML = "Installed (found at " + concatWith(files, ", ") + ")"
		}
	})
}

function getGlobalVariables() {
	var ret = ""
	var gvWarning = "Electron's remote module caches remote objects, which this section depends on. It's generally accurate most of the time but take it with a grain of salt."
	var isDbg = "\"isInDebugEnv\": " + remote.getGlobal("isInDebugEnv")
	var isFDbg = "\"isInFullscreenDebugEnv\": " + remote.getGlobal("isInFullscreenDebugEnv")

	ret = "<p>" + gvWarning + "</p><p>" + isDbg + "<br />" + isFDbg + "<br />"

	var gvPath = "../configs/globalvariables.json"
	var gvObj = JSON.parse(fs.readFileSync(path.resolve(__dirname, gvPath)));

	for (var e in gvObj) {
		ret += JSON.stringify(e) + ": " + JSON.stringify(gvObj[e]) + "<br />"
	}

	ret += "</p>"

	document.getElementById('global-variables-content')
		.innerHTML = ret
}

function getGlobalVariablesCount() {
	var gvPath = "../configs/globalvariables.json"
	var gvObj = JSON.parse(fs.readFileSync(path.resolve(__dirname, gvPath)));

	document.getElementById('global-variables-label')
		.innerHTML = "Total tracked global variables: " + (Object.keys(gvObj)
			.length + 2)
}

function getPlatform() {
	var lp = ""

	// cproc.exec('reg query HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\FileSystem /v LongPathsEnabled', (err, stdout, stderr) => {
	// 	logDebug(stdout)
	// 	logDebug(parseInt(stdout.trim()
	// 		.substring(stdout.trim()
	// 			.length - 1, stdout.trim()
	// 			.length - 0)))
	// 	if (parseInt(stdout.trim()
	// 			.substring(stdout.trim()
	// 				.length - 1, stdout.trim()
	// 				.length - 0)) == 1) {
	// 		lp = ", long path enabled"
	// 		logDebug("NEW " + lp)
	// 	} else {
	// 		lp = ", long path NOT enabled"
	// 	}
	// })
	// 
	var lpret = cproc.spawn('reg', ['query', 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\FileSystem', '/v', 'LongPathsEnabled'])
	lpret.stdout.on('data', (data) => {
		// logDebug(data)
		lp = data.toString().trim()

		if (parseInt(lp
				.substring(lp.length - 1, lp.length - 0)) == 1) {
			lp = ", long path enabled"
			logDebug("NEW " + lp)
		} else {
			lp = ", long path NOT enabled"
		}

		// logDebug("NEW2 " + lp)

		document.getElementById('misc-platform-info')
			.innerHTML = OS.type() + " " + OS.release() + " (" + OS.arch() + ", uptime " + OS.uptime() + lp + ")"
	})

}