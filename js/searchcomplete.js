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
        document.getElementById("status-msg")
            .innerHTML = searchResult.toUpperCase()
        // ipcRenderer.send("timed-status-change", 0)
    }
})

require('electron')
    .remote.getCurrentWindow()
    .webContents.once('dom-ready', async () => {
        if (require('electron')
            .remote.getGlobal("isLowRes")) {
            require('electron')
                .webFrame.setZoomFactor(0.8)
        }

        for (var i = 240 + Math.floor(Math.random() * 20); i > 0; i--) {
            await sleep(1000)
            if (i > 2) {
                document.getElementById("item-timer")
                    .innerHTML = "Returning to search page in " + (i - 1) + " seconds."

                if (i == 100) {
                    if (Math.random > 0.5) {
                        i += Math.floor(Math.random() * 5)
                    }
                }
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