const {
	ipcRenderer,
	remote
} = require('electron')

let searchResult = ""

ipcRenderer.once('search-complete-relay', (event, message) => {
	searchResult = message
	if (searchResult != "") {
		document.getElementById("item-desc")
			.innerHTML = "“" + searchResult.toUpperCase() + "” HAS BEEN ADDED TO THE QUEUE."
	}
})

require('electron')
	.remote.getCurrentWindow()
	.webContents.once('dom-ready', async () => {
		for (var i = 21; i > 0; i--) {
			await sleep(1000)
			if (i > 2) {
				document.getElementById("item-timer")
					.innerHTML = "Returning to search page in " + (i - 1) + " seconds."
			} else if (i == 2) {
				document.getElementById("item-timer")
					.innerHTML = "Returning to search page in " + (i - 1) + " second."
			} else {
				document.getElementById("item-timer")
					.innerHTML = " "
			}
		}

		ipcRenderer.send("preview-cancelled")
	});

sleep = (ms) => {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}