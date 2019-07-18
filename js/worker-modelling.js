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
            // let cmd0 = new Promise((resolve, reject) => {
            //     conn.exec(cmds[0], (err, stream) => {
            //         if (err) {
            //             logMain("[WK_MDL] ssh2 - exec/0 failed: " + err)
            //         }
            //         stream.on('close', (ecode, sig) => {
            //             logMain("[WK_MDL] ssh2 - exec/0 stream close: exit code " + ecode + ", signal: " + sig)
            //             if (ecode == 0) {
            //                 resolve()
            //             } else {
            //                 reject()
            //             }
            //             // stream.end()
            //             // exec/1
            //             // 
            //         }).on('data', (data) => {
            //             // stdout
            //             logMain("[WK_MDL] ssh2 - exec/0 STDOUT: " + data)
            //         }).stderr.on('data', (data) => {
            //             // stderr
            //             logMain("[WK_MDL] ssh2 - exec/0 STDERR: " + data)
            //         })
            //         setTimeout(() => {
            //             stream.signal("QUIT")
            //             stream.end("\nTimeout\n")
            //             reject(new Error("time out"))
            //         }, cmdsTO[0] * 1000)
            //     })
            // })

            // cmd0.then(() => {
            //     logMain("[WK_MDL] COMPLETE-2")
            // }).catch((err) => {
            //     logMain("[WK_MDL] ERR-2: " + err)
            //     canMoveOn = false
            // })


            for (let i = 0; i < cmds.length; i++) {
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
                            // stream.end()
                            // exec/1
                            // 
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
                    canMoveOn = false
                })
            }

        })
        .connect({
            host: rmtIP,
            port: 22,
            username: rmtUser,
            privateKey: require('fs').readFileSync('C:\\Users\\Tianyu\\.ssh\\id_rsa')
        })
})