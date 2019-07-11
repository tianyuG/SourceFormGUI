const {
	ipcRenderer,
	remote
} = require('electron')
const cproc = require('child_process')

ipcRenderer.on('worker-printing-request') {
	// TODO: Might look into npm package johnny-five
	// cproc.exec()
}