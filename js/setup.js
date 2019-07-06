// Initial setup for assigning contents on both displays

const {
	ipcRenderer,
	remote
} = require('electron')
const {
	app,
	BrowserWindow,
	shell,
	dialog
} = remote
const os = require('os')
const fs = require('fs')
	.promises

require('electron')
	.remote.getCurrentWindow()
	.webContents.once('dom-ready', () => {
		fs.access(`C:\\Program Files\\AutoHotkey\\AutoHotkey.exe`, (err) => {
			if (err) {
				document.getElementById('start-ahk-button')
					.style.display = "none"
				document.getElementById('stop-ahk-button')
					.style.display = "none"
				document.getElementById('ahk-installation-status-warning')
					.innerHTML = "AHK is not installed."
			}
		})

		const startahkbtn          = document.getElementById('start-ahk-button');
		const stopahkbtn           = document.getElementById('stop-ahk-button');
		const flickrkeycurr        = document.getElementById('flickrkey-current');
		const flickrkeybtn         = document.getElementById('flickrkey-button');
		const flickrkeybtnreset    = document.getElementById('flickrkey-button-reset');
		const flickrkeyinput       = document.getElementById('flickrkey-input')
		const flickrkeybtncnfm     = document.getElementById('flickrkey-button-confirm');
		const flickrsecretcurr     = document.getElementById('flickrsecret-current');
		const flickrsecretbtn      = document.getElementById('flickrsecret-button');
		const flickrsecretbtnreset = document.getElementById('flickrsecret-button-reset');
		const flickrsecretinput    = document.getElementById('flickrsecret-input')
		const flickrsecretbtncnfm  = document.getElementById('flickrsecret-button-confirm');
		const imagepathcurr        = document.getElementById('imagepath-current');
		const imagepathbtn         = document.getElementById('imagepath-button');
		const ply2stlcurr          = document.getElementById('ply2stl-current');
		const ply2stlbtn           = document.getElementById('ply2stl-button');
		const stl2bmpcurr          = document.getElementById('stl2bmp-current');
		const stl2bmpbtn           = document.getElementById('stl2bmp-button');
		const printerscriptcurr    = document.getElementById('printerscript-current');
		const printerscriptbtn     = document.getElementById('printerscript-button');
		const numofimgscurr        = document.getElementById('numofimgs-current');
		const numofimgsbtn         = document.getElementById('numofimgs-button');
		const numofimgsinput       = document.getElementById('numofimgs-input')
		const numofimgsbtncnfm     = document.getElementById('numofimgs-button-confirm');
		const remoteipcurr         = document.getElementById('remoteip-current');
		const remoteipbtn          = document.getElementById('remoteip-button');
		const remoteipinput        = document.getElementById('remoteip-input')
		const remoteipbtncnfm      = document.getElementById('remoteip-button-confirm');
		const remoteipwarning      = document.getElementById('remoteip-warning');

		flickrkeycurr.innerHTML = require('electron')
			.remote.getGlobal('flickrKey')
		flickrsecretcurr.innerHTML = require('electron')
			.remote.getGlobal('flickrSecret')
		imagepathcurr.innerHTML = require('electron')
			.remote.getGlobal('imagePath')
		ply2stlcurr.innerHTML = require('electron')
			.remote.getGlobal('PLY2STLScriptPath')
		stl2bmpcurr.innerHTML = require('electron')
			.remote.getGlobal('STL2BMPScriptPath')
		printerscriptcurr.innerHTML = require('electron')
			.remote.getGlobal('printerScriptPath')
		numofimgscurr.innerHTML = require('electron')
			.remote.getGlobal('numberOfImagesPerModel')
		remoteipcurr.innerHTML = require('electron')
			.remote.getGlobal('remoteIP')

		/*
		 * XXX: SANITISE INPUT!!!
		 */

		flickrkeybtn.addEventListener('click', () => {
			flickrkeyinput.style.display = "inline"
			flickrkeybtn.style.display = "none"
			flickrkeybtncnfm.style.display = "inline"
		});

		flickrkeybtnreset.addEventListener('click', () => {
			flickrkeyinput.style.display = "inline"
			flickrkeybtn.style.display = "none"
			flickrkeybtncnfm.style.display = "inline"
			flickrkeybtnreset.style.display = "none"
			flickrkeyinput.value = require('electron')
				.remote.getGlobal('flickrKey_default')
		});

		flickrkeybtncnfm.addEventListener('click', () => {
			flickrkeybtn.style.display = "inline"
			flickrkeybtncnfm.style.display = "none"
			flickrkeyinput.style.display = "none"
			flickrkeybtnreset.style.display = "inline"
			if (flickrkeyinput.value.trim != "") {
				ipcRenderer.send("set-globalvariable", ["flickrKey", flickrkeyinput.value])
				flickrkeycurr.innerHTML = require('electron')
					.remote.getGlobal('flickrKey')
			}
		});

		flickrsecretbtn.addEventListener('click', () => {
			flickrsecretinput.style.display = "inline"
			flickrsecretbtn.style.display = "none"
			flickrsecretbtncnfm.style.display = "inline"
		});

		flickrsecretbtnreset.addEventListener('click', () => {
			flickrsecretinput.style.display = "inline"
			flickrsecretbtn.style.display = "none"
			flickrsecretbtncnfm.style.display = "inline"
			flickrsecretbtnreset.style.display = "none"
			flickrsecretinput.value = require('electron')
				.remote.getGlobal('flickrSecret_default')
		});

		flickrsecretbtncnfm.addEventListener('click', () => {
			flickrsecretbtn.style.display = "inline"
			flickrsecretbtncnfm.style.display = "none"
			flickrsecretinput.style.display = "none"
			flickrsecretbtnreset.style.display = "inline"
			if (flickrsecretinput.value.trim != "") {
				ipcRenderer.send("set-globalvariable", ["flickrSecret", flickrsecretinput.value])
				flickrsecretcurr.innerHTML = require('electron')
					.remote.getGlobal('flickrSecret')
			}
		});

		flickrsecretinput.addEventListener("keyup", () => {
			if (event.keyCode == 13) {
				flickrsecretbtncnfm.click()
			}
		})

		flickrkeyinput.addEventListener("keyup", () => {
			if (event.keyCode == 13) {
				flickrkeybtncnfm.click()
			}
		})

		// Add button to change imagePath
		imagepathbtn.addEventListener('click', () => {
			let imgpath = dialog.showOpenDialog({
				properties: ['openDirectory']
			})
			ipcRenderer.send("set-globalvariablepath", ["imagePath", imgpath])
			imagepathcurr.innerHTML = require('electron')
				.remote.getGlobal('imagePath')
		});

		ply2stlbtn.addEventListener('click', () => {
			let ply2stlpath = dialog.showOpenDialog({
				properties: ['openFile'],
				filters: [{
						name: 'Python (*.py)',
						extensions: ['py']
					},
					{
						name: 'All',
						extensions: ['*']
					}
				]
			})
			// logMain("[SETUP] " + ply2stlpath)
			ipcRenderer.send("set-globalvariablepath", ["PLY2STLScriptPath", ply2stlpath])
			ply2stlcurr.innerHTML = require('electron')
				.remote.getGlobal('PLY2STLScriptPath')
		});

		stl2bmpbtn.addEventListener('click', () => {
			let stl2bmppath = dialog.showOpenDialog({
				properties: ['openFile'],
				filters: [{
						name: 'Python (*.py)',
						extensions: ['py']
					},
					{
						name: 'All',
						extensions: ['*']
					}
				]
			})
			ipcRenderer.send("set-globalvariable", ["STL2BMPScriptPath", stl2bmppath])
			stl2bmpcurr.innerHTML = require('electron')
				.remote.getGlobal('STL2BMPScriptPath')
		});

		printerscriptbtn.addEventListener('click', () => {
			let printerscriptpath = dialog.showOpenDialog({
				properties: ['openFile'],
				filters: [{
						name: 'Arduino (*.ino)',
						extensions: ['ino']
					},
					{
						name: 'C/C++ (*.c, *.cpp)',
						extensions: ['c', 'cpp']
					},
					{
						name: 'All',
						extensions: ['*']
					}
				]
			})
			ipcRenderer.send("set-globalvariablepath", ["printerScriptPath", printerscriptpath])
			printerscriptcurr.innerHTML = require('electron')
				.remote.getGlobal('printerScriptPath')
		});

		numofimgsbtn.addEventListener('click', () => {
			numofimgsinput.style.display = "inline"
			numofimgsbtn.style.display = "none"
			numofimgsbtncnfm.style.display = "inline"
		});

		numofimgsbtncnfm.addEventListener('click', () => {
			if (numofimgsinput.value >= 200 && numofimgsinput.value <= 1000) {
				numofimgsbtn.style.display = "inline"
				numofimgsbtncnfm.style.display = "none"
				numofimgsinput.style.display = "none"
				ipcRenderer.send("set-globalvariable", ["numberOfImagesPerModel", numofimgsinput.value])
				numofimgscurr.innerHTML = require('electron')
					.remote.getGlobal('numberOfImagesPerModel')
			}
		});

		numofimgsinput.addEventListener("keyup", () => {
			if (event.keyCode == 13) {
				numofimgsbtncnfm.click()
			}
		})

		// Button to allow editing remoteIP
		remoteipbtn.addEventListener('click', () => {
			remoteipinput.style.display = "inline"
			remoteipbtn.style.display = "none"
			remoteipbtncnfm.style.display = "inline"
		});

		// Commit remoteIP change with validation checks
		remoteipbtncnfm.addEventListener('click', () => {
			const isIp = require('is-ip');
			if (remoteipinput.value.trim() == "") {
				remoteipinput.style.display = "none"
				remoteipbtn.style.display = "inline"
				remoteipbtncnfm.style.display = "none"
			} else if (!isIp(remoteipinput.value)) {
				remoteipwarning.style.display = "block"
				remoteipinput.style.color = "orange"
			} else {
				remoteipwarning.style.display = "none"
				remoteipinput.style.color = "black"
				remoteipinput.style.display = "none"
				remoteipbtn.style.display = "inline"
				remoteipbtncnfm.style.display = "none"
				ipcRenderer.send("set-globalvariable", ["remoteIP", remoteipinput.value.trim()])
				remoteipcurr.innerHTML = require('electron')
					.remote.getGlobal('remoteIP')
			}
		});

		// Pressing enter will have same effect as clicking on the confirm button
		remoteipinput.addEventListener("keyup", () => {
			if (event.keyCode == 13) {
				remoteipbtncnfm.click()
			}
		})
	});