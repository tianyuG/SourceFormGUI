const {
	ipcRenderer,
	remote
} = require("electron");

document.addEventListener("keydown", function(e) {
	// logDebug(e.key)
	if (e.ctrlKey && e.altKey && e.key === 'J') {
		// logDebug("ctrl-alt-shift-d pressed.")
		ipcRenderer.send("open-diagnostics")
	}
	if (e.ctrlKey && e.altKey && e.key === 'K') {
		// logDebug("ctrl-alt-shift-d pressed.")
		ipcRenderer.send("open-diagnostics-main")
	}
	if (e.ctrlKey && e.altKey && e.key === 'N') {
		// logDebug("ctrl-alt-shift-d pressed.")
		ipcRenderer.send("open-setup")
	}
	if (e.ctrlKey && e.altKey && e.key === 'M') {
		// logDebug("ctrl-alt-shift-d pressed.")
		ipcRenderer.send("open-setup-main")
	}

	if (e.ctrlKey && e.altKey && e.key === 'Q') {
		// logDebug("ctrl-alt-shift-d pressed.")
		ipcRenderer.send("quit-app")
	}
	// switch (event.key) {
	// 	case "F11":
	// 		console.log("F11 pressed.");
	// 		remote.getCurrentWindow()
	// 			.maximize()
	// 		break;
	// 	}
});