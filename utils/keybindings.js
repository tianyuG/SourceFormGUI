const {
	ipcRenderer,
	remote
} = require("electron");

document.addEventListener("keydown", function(e) {
	// logDebug(e.key)
	if (e.ctrlKey && e.altKey && e.key === 'D') {
		// logDebug("ctrl-alt-shift-d pressed.")
		ipcRenderer.send("open-diagnostics")
	}
	// switch (event.key) {
	// 	case "F11":
	// 		console.log("F11 pressed.");
	// 		remote.getCurrentWindow()
	// 			.maximize()
	// 		break;
	// 	}
});