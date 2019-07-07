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
	// Step 3: meshlab ply -> stl
	// Step 4: stl -> bmps
	// Step 5: Retrieve bmps
})