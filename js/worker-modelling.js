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
    logMain("[WK_MDL] Acquired modelling request.")
    let projName = message['projname']
    let absPath = message['abspath']
    let rmtPath = message['rmtpath']
    let cmds = message['commands']
    let cmdsTO = require('electron').remote.getGlobal('remoteCommandsTimeout')

    let rmtUser = require('electron').remote.getGlobal('remoteUsername')

    let Client = ssh.Client
    let conn = new Client()
    let rmtIP = require('electron').remote.getGlobal('remoteIP')
    let canMoveOn = true

    conn.on('ready', async () => {
    	for (let i = 0; i < cmds.length; i++) {
    		if (canMoveOn) {
    			let cmdlet = new Promise((resolve, reject) => {
    				conn.exec(cmds[i], (err, stream) => {
    					if (err) {
    						logMain("[WK_MDL] ssh2 - exec/" + i + " failed: " + err)
    					}
    					stream.on('close', (ecode, sig) => {
    						logMain("[WK_MDL] ssh2 - exec/" + i + " stream close: exit code " + ecode + ", signal: " + sig)
    						if (ecode == 0) {
    							resolve()
    						} else {
    							reject()
    						}
    					}).on('data', (data) => {
                // stdout
                logMain("[WK_MDL] ssh2 - exec/" + i + " STDOUT: " + data)
              }).stderr.on('data', (data) => {
                // stderr
                logMain("[WK_MDL] ssh2 - exec/" + i + "STDERR: " + data)
              })
              setTimeout(() => {
              	stream.signal("QUIT")
              	reject(new Error("exec/" + i + " timed out"))
              }, cmdsTO[i] * 1000)
            })
    			})

    			await cmdlet.then(() => {
    				logMain("[WK_MDL] COMPLETE-2")
    			}).catch((err) => {
    				logMain("[WK_MDL] ERR-2: " + err)
    				ipcRenderer.send("worker-modelling-failed-at", i)
    				canMoveOn = false
    			})
    		}
    	}

    	// TODO:
    	// If all commands are executed successfully, fetch sliced images from remote
    })
    .connect({
    	host: rmtIP,
    	port: 22,
    	username: rmtUser,
    	privateKey: require('fs').readFileSync('C:\\Users\\Tianyu\\.ssh\\id_rsa')
    })
  })