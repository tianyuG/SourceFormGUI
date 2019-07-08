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
	// Step 1: COLMAP photogrammetry
	// Step 2: pointcloud.py postprocessing point cloud
	// (optionally retrieve ply and display at secondary monitor)
	// Step 3: meshlab ply -> stl
	// Step 4: stl -> bmps
	// Step 5: Retrieve bmps
	// message: { projname:projectName, abspath:absImagePath, rmtPath:rmtImgPath }
	// 
	let projName = message['projname']
	let absPath = message['abspath']
	let rmtPath = message['rmtpath']

	let Client = ssh.Client()
	let conn = new Client()

	conn.on('ready', () => {
			// Step 1: COLMAP
			conn.exec(path.resolve(rmtPath, "./run.bat"), (err, stream) => {
				if (err) {
					logMain("[WK_MDL] ssh2 - COLMAP failed: " + err)
				}

				stream.on('close', (ecode, signal) => {
						logMain("[WK_MDL] ssh2 - COLMAP stream close: exit code " + ecode + ", signal: " + signal)

						// Step 2: pointcloud.py
						// 
						// // EVENTUALLY: conn.end()
					})
					.on('data', (data) => {
						// STDOUT
					})
					.stderr.on('data', (err) => {
						// STDERR
					})
				})
			})
		})
		.connect({
			host: rmtIP,
			port: 22,
			username: 'SourceForm',
			privateKey: require('fs')
				.readFileSync(path.resolve(require('os')
					.homedir(), "./.ssh/id_rsa"));
		})
})