const {
	ipcRenderer,
	remote
} = require('electron')
const OS = require('os')
const path = require('path')
const fs = require('fs')
	.promises
const cproc = require('child_process')
const glob = require("glob")

const getNetworkInterfaceInfo = () => {
	let netint = OS.networkInterfaces();
	for (i = 0; i < Object.keys(netint)
		.length; i++) {
		let k1 = document.createElement("p");
		let c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(netint)[i]);
		k1.className = "bold-item";
		k1.appendChild(c1);
		document.getElementById("network-info-content")
			.appendChild(k1);
		let k2 = document.createElement("p");
		let c2 = document.createTextNode(JSON.stringify(Object.values(netint)[i], null, 2));
		k2.appendChild(c2);
		document.getElementById("network-info-content")
			.appendChild(k2);
	}
}

const getDisplayInfo = () => {
	let disp = require('electron')
		.remote.getGlobal('displays')
	for (i = 0; i < Object.keys(disp)
		.length; i++) {
		let k1 = document.createElement("p");
		let c1 = document.createTextNode('#' + (i + 1) + ": " + Object.keys(disp)[i]);
		k1.className = "bold-item";
		k1.appendChild(c1);
		document.getElementById("display-content")
			.appendChild(k1);
		let k2 = document.createElement("p");
		let c2 = document.createTextNode(JSON.stringify(Object.values(disp)[i], null, 2));
		k2.appendChild(c2);
		document.getElementById("display-content")
			.appendChild(k2);
	}
}

const getDependencies = () => {
	// AHK
	// Use `/` instead of `\\` in filepath, even in Windows!
	// `\\` is reserved for escape character in glob.
	ifFileExists("C:/Program Files/AutoHotkey/AutoHotkey.exe", "ahk-installation-status", "AHK", "https://www.autohotkey.com/")
	ifFileExists("C:/Program Files/ImageMagick-*/magick.exe", "imagemagick-installation-status", "imagemagick", "https://imagemagick.org/script/download.php#windows")
	ifFileExists("C:/Python27/python.exe", "python27-installation-status", "python 2.7", "https://www.python.org/downloads/")
	ifFileExists("C:/Program Files/VCG/Meshlab/bin/meshlabserver.exe", "meshlab-installation-status", "meshlab", "http://www.meshlab.net/")
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
		checkLocalJSONFiles();
		if (require('electron').remote.getGlobal("isLowRes")) {
			require('electron').webFrame.setZoomFactor(0.8)
		}
	});

// Use `/` instead of `\\` in filepath, even in Windows!
// `\\` is reserved for escape character in glob.
const ifFileExists = (filepath, elementId, appName, appUrl, errorMsg = null) => {
	glob(filepath, function(err, files) {
		if (files.length < 1) {
			if (errorMsg != null) {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"msg italic-item\">search path: " + filepath + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>." + "<br />" + errorMsg + "</p>"
			} else {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"msg italic-item\">search path: " + filepath + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>.</p>"
			}
		} else if (err) {
			if (errorMsg != null) {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"msg italic-item\">search path: " + filepath + "<br />error message: " + err + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>." + "<br />" + errorMsg + "</p>"
			} else {
				document.getElementById(elementId)
					.innerHTML = "Not installed." + "<p class=\"msg italic-item\">search path: " + filepath + "<br />error message: " + err + "<br />" + appName + " can be downloaded from <a href=\"" + appUrl + "\">" + appUrl + "</a>.</p>"
			}
		} else {
			document.getElementById(elementId)
				.innerHTML = "Installed (found at " + concatWith(files, ", ") + ")"
		}
	})
}

const getGlobalVariables = async () => {
	let ret = ""
	let gvWarning = "Electron's remote module caches remote objects, which this section depends on. It's generally accurate most of the time but take it with a grain of salt."
	let isDbg = "\"isInDebugEnv\": " + remote.getGlobal("isInDebugEnv")
	let isFDbg = "\"isInFullscreenDebugEnv\": " + remote.getGlobal("isInFullscreenDebugEnv")

	ret = "<p>" + gvWarning + "</p><p>" + isDbg + "<br />" + isFDbg + "<br />"

	let gvPath = "../configs/globalvariables.json"
	let gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

	for (let e in gvObj) {
		ret += JSON.stringify(e) + ": " + JSON.stringify(gvObj[e]) + "<br />"
	}

	ret += "</p>"

	document.getElementById('global-variables-content')
		.innerHTML = ret
}

const getGlobalVariablesCount = async () => {
	const gvPath = "../configs/globalvariables.json"
	let gvObj = JSON.parse(await fs.readFile(path.resolve(__dirname, gvPath)));

	document.getElementById('global-variables-label')
		.innerHTML = "Total tracked global variables: " + (Object.keys(gvObj)
			.length + 2)
}

const getPlatform = () => {
	let lp = ""
	let lpret = cproc.spawn('reg', ['query', 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\FileSystem', '/v', 'LongPathsEnabled'])
	lpret.stdout.on('data', (data) => {
		// logDebug(data)
		lp = data.toString()
			.trim()

		if (parseInt(lp
				.substring(lp.length - 1, lp.length - 0)) == 1) {
			lp = ", long path enabled"
			logDebug("NEW " + lp)
		} else {
			lp = ", long path NOT enabled"
		}

		document.getElementById('misc-platform-info')
			.innerHTML = OS.type() + " " + OS.release() + " (" + OS.arch() + ", uptime " + OS.uptime() + lp + ")"
	})
}

const checkJSONHealth = async (path, id) => {
	let jsonObj = await fs.readFile(path)
	let statObj = await fs.stat(path)

	try {
		JSON.parse(jsonObj)
	} catch (err) {
		if (err) {
			document.getElementById(id)
				.innerHTML = "Corrupted: " + err + "<br />Size: " + getHumanReadableFileSize(statObj.size, true)
		}
	}
	document.getElementById(id)
		.innerHTML = "Healthy." + "<br />Size: " + getHumanReadableFileSize(statObj.size, true)
}

const checkLocalJSONFiles = () => {
	let wd = process.cwd()
	// Carousel
	checkJSONHealth(path.resolve(wd, "./carousel/content.json"), "carousel-json-status")
	// Config
	checkJSONHealth(path.resolve(wd, "./configs/globalvariables.json"), "globalvariables-json-status")
}

const getHumanReadableFileSize = (size, usesSIUnit) => {
	let baseSize = 1000 
	let units = ["B", "KB", "MB", "GB", "TB", "PB"]
	let fsize = size
	let i = 0
	if (!usesSIUnit) {
		baseSize = 1024
		units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]
	}

	// logDebug(baseSize + " " + units)
	
	while (Math.abs(fsize) > baseSize && i < units.length) {
		fsize /= baseSize
		i++
	}

	// logDebug(fsize.toFixed(2) + " " + units[i])
	return fsize.toFixed(1) + units[i]
}