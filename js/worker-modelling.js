const {
	ipcRenderer,
	remote
} = require('electron')
const path = require("path")
const fs = require('fs')
	.promises
const ssh = require('ssh2')
const glob = require('glob')

ipcRenderer.on('worker-modelling-request', async (event, message) => {
	// message: { projname:projectName, abspath:absImagePath, rmtPath:rmtImgPath }
	// 
	let projName = message['projname']
	let absPath = message['abspath']
	let rmtPath = message['rmtpath']
	let cmds = message['commands']

	let Client = ssh.Client()
	let conn = new Client()

	conn.on('ready', () => {
			// conn.exec(path.join(rmtPath, "run.bat").replace(/\\+/g, '\\\\'), (err, stream) => {
			// 	if (err) {
			// 		logMain("[WK_MDL] ssh2 - COLMAP failed: " + err)
			// 	}

			// 	stream.on('close', (ecode, signal) => {
			// 			logMain("[WK_MDL] ssh2 - COLMAP stream close: exit code " + ecode + ", signal: " + signal)
			// 			// Retrieve bmps once it's complete
			// 			conn.end()
			// 		})
			// 		.on('data', (data) => {
			// 			// STDOUT
			// 			// Monitor stdout and retrieve ply model once it's complete
			// 		})
			// 		.stderr.on('data', (err) => {
			// 			// STDERR
			// 		})
			// })
			conn.exec(cmds[0], (err, stream) => {
				if (err) { logMain("[WK_MDL] ssh2 - exec/0 failed: " + err) }
			})

			stream.on('close', (ecode, sig) => {
				logMain("[WK_MDL] ssh2 - exec/0 stream close: exit code " + ecode + ", signal: " + signal)
				// exec/1
				// 
			}).on('data', (data) => {
				// stdout
			}).stderr.on('data', (data) => {
				// stderr
			})
		})
		.connect({
			host: rmtIP,
			port: 22,
			username: 'SourceForm',
			privateKey: require('fs')
				.readFileSync(path.join(require('os')
					.homedir(), "/.ssh/id_rsa"));
		})
})
