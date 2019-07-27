const {
	ipcRenderer,
	remote
} = require('electron')
const cproc = require('child_process')

ipcRenderer.on('worker-printing-request', async (event, message) => {
	// TODO: Might look into npm package johnny-five
	// cproc.exec()
	// python [printer_script] [path_to_image_slices]
})