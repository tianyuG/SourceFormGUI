const {
	ipcRenderer,
	remote
} = require("electron");

document.addEventListener("keydown", function(e) {

	/*
	 * ctrl-shift-alt-i =>
	 * Open chrome devtools in secondary screen
	 */
	if (e.ctrlKey && e.altKey && e.key === 'I') {
		ipcRenderer.send("open-devtools")
	}
	/*
	 * ctrl-shift-alt-o =>
	 * Open chrome devtools in main screen
	 */
	if (e.ctrlKey && e.altKey && e.key === 'O') {
		ipcRenderer.send("open-devtools-main")
	}
	/*
	 * ctrl-shift-alt-j =>
	 * Open diagnostics in secondary screen
	 */
	if (e.ctrlKey && e.altKey && e.key === 'J') {
		ipcRenderer.send("open-diagnostics")
	}
	/*
	 * ctrl-shift-alt-k =>
	 * Open diagnostics in main screen
	 */
	if (e.ctrlKey && e.altKey && e.key === 'K') {
		ipcRenderer.send("open-diagnostics-main")
	}
	/*
	 * ctrl-shift-alt-n =>
	 * Open setup in secondary screen
	 */
	if (e.ctrlKey && e.altKey && e.key === 'N') {
		ipcRenderer.send("open-setup")
	}
	/*
	 * ctrl-shift-alt-m =>
	 * Open setup in main screen
	 */
	if (e.ctrlKey && e.altKey && e.key === 'M') {
		ipcRenderer.send("open-setup-main")
	}

	/*
	 * ctrl-shift-alt-q =>
	 * Quit app
	 */
	if (e.ctrlKey && e.altKey && e.key === 'Q') {
		ipcRenderer.send("quit-app")
	}
});