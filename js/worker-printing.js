const {
	ipcRenderer,
	remote
} = require('electron')
const { execFile } = require('child_process')

ipcRenderer.on('worker-printing-request', async (event, message) => {
	// TODO: Might look into npm package johnny-five
	// cproc.exec()
	// python [printer_script] [path_to_image_slices]
	execFile('python', [message[localSlicesPath]], (err, stdout, stderr) => {
		if (error) {
			logMain("[WK_PRN] failed to execFile: " + error)
		}

		if (stdout) {
			logMain("[WK_PRN] execFile STDOUT: " + stdout)
		}

		if (stderr) {
			logMain("[WK_PRN] execFile STDERR: " + stderr)
		}
	})
})