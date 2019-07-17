/*
 * Download worker assumes that either the search term is unique, or the user
 * has agreed to redownload (update) an existing image set
 */

const {
    ipcRenderer,
    remote
} = require('electron')
const Flickr = require('flickr-sdk');
const http = require('http');
const parse = require('url')
    .parse;
const purify = require('dompurify')
const path = require("path")
const fs = require('fs')
    .promises
const ssh = require('ssh2')
const glob = require('glob')
// const Readable = require('stream')
// 	.Readable

let flickr = new Flickr(require('electron')
    .remote.getGlobal('flickrKey'))

ipcRenderer.on('worker-download-search', async (event, message) => {
    let t = new Date()
    let t_iso = t.toISOString()
    let name_o = message.trim()
    let name_s = purify.sanitize(name_o)
    let name_f = name_s.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/\\+/g, '')
        .replace(/\"+/g, '')

    let ident = name_f + "_" + t.getTime()
    let ident_t = "./" + ident
    let baseImagePath = path.resolve(remote.getGlobal('imagePath'))
    let absImagePath = path.resolve(baseImagePath, ident_t)
    let currImageCount = parseInt(remote.getGlobal('numberOfImagesPerModel'))

    // Creating folder
    await fs.mkdir(absImagePath)

    let jsonFile = await fs.readFile(path.resolve(__dirname, "../carousel/content.json"))
    let jsonObj = JSON.parse(jsonFile)
    let jsonKeys = Object.keys(jsonObj)
    let lastIndex = jsonKeys[jsonKeys.length - 1]
    let currIndex = (parseInt(lastIndex, 10) + 1)
        .toString()
        .padStart(4, '0')

    // Populate manifest with search results
    let results = []
    let imageSize = require('electron')
        .remote.getGlobal("imageSize")
    let perPage = require('electron')
        .remote.getGlobal('imagesPerPage')
    // It is possible for flickr not to return an url because it does not have 
    // the size required. The extraPageCount is used to get more images than 
    // required so it would not be off by too much. The lowest it can go should
    // be 1.
    let extraPageCount = require('electron')
        .remote.getGlobal("extraPageCount")
    results = await populateManifest(currImageCount, perPage, name_s, imageSize, absImagePath, extraPageCount)

    // Update catalogue
    let currRecord = ""
    currRecord += "{ "
    currRecord += "\"title\": \"" + name_s.replace(/\"+/g, "\\\"") + "\", "
    currRecord += "\"sanitised_title\": \"" + name_f + "\", "
    currRecord += "\"path\": \"" + absImagePath.replace(/\\+/g, "\\\\") + "\", "
    currRecord += "\"thumbnail\": \"" + currIndex + ".jpg\", "
    currRecord += "\"updated\": \"" + t_iso + "\", "
    currRecord += "\"accessed\": \"" + t_iso + "\", "
    currRecord += "\"image_count\": " + results.length + ", "
    currRecord += "\"display\": false"
    currRecord += " }"
    jsonObj[currIndex] = JSON.parse(currRecord)
    await fs.writeFile(path.resolve(__dirname, "../carousel/content.json"), JSON.stringify(jsonObj, null, 2))

    ipcRenderer.send('image-download-request', {
        url: results,
        properties: {
            directory: absImagePath,
            projn: ident
        }
    })
})

ipcRenderer.on('worker-download-image-complete', async (event, message) => {
    // logMain(message["d"])
    await transferToRemote(message["n"], message["d"])
})

/*
 * Async function to fetch manifest list from flickr
 */
const populateManifest = async (currImageCount, perPage, name_s, imageSize, absImagePath, extraPageCount) => {
    let resultsCount = 0
    let pagesNeeded = parseInt(currImageCount / perPage) + extraPageCount
    let res = []
    let promises = []
    let urls = []

    for (let i = 1; i < pagesNeeded; i++) {
        let result = flickr.photos.search({
            text: name_s,
            extras: imageSize + ", owner_name, description, license",
            privacy_filter: 1,
            safe_search: 3,
            sort: "relevance",
            per_page: perPage,
            page: i
        })

        promises.push(result)
    }
    res = await Promise.all(promises)

    for (let resobj in res) {
        pageIndex = res[resobj].body.photos.page
        let manifestRelPath = "./manifest_" + pageIndex + ".json"
        await fs.writeFile(path.join(absImagePath, manifestRelPath), JSON.stringify(res[resobj].body.photos, null, 2))
        for (let imgobj in res[resobj].body.photos.photo) {
            let ret = res[resobj].body.photos.photo[imgobj][imageSize]
            if (typeof ret != "undefined") {
                urls.push(ret)
            }
        }
    }

    // let urlsRelPath = "./urls" + urls.length + ".json"
    let urlsRelPath = "./" + imageSize + ".json"
    await fs.writeFile(path.join(absImagePath, urlsRelPath), JSON.stringify(urls, null, 2))
    return urls
}

const transferToRemote = async (projectName, localPath) => {
    logMain("[WK_DLD] Starting to transfer to remote.")
    let rmtIP = require('electron')
        .remote.getGlobal('remoteIP')
    let rmtPath = require('electron')
        .remote.getGlobal('remotePath')
    logMain("[WK_DLD] rmtIP, rmtPath: " + rmtIP + " " + rmtPath)
    logMain("[WK_DLD] projectName, localPath: " + projectName + " " + localPath)
    let rmtProjPath = require('path').join(rmtPath, projectName)
    let rmtImgPath = require('path').join(rmtProjPath, "/images")
    logMain("[WK_DLD] rmtProjPath, rmtImgPath: " + rmtProjPath + " " + rmtImgPath)

    let colmapPath = require('electron').remote.getGlobal('remoteCOLMAPPath')
    logMain("[WK_DLD] colampPath: " + colmapPath)
    let colmapExecPath = "/" + path.join(colmapPath, "COLMAP.bat").replace(/:+/g, '').replace(/\\+/g, '/').replace(/ +/g, '\\ ')
    logMain("[WK_DLD] colmapExecPath: " + colmapExecPath)
    let meshlabPath = "/" + require('electron').remote.getGlobal('remoteMeshlabPath').replace(/:+/g, '').replace(/\\+/g, '/').replace(/ +/g, '\\ ')
    logMain("[WK_DLD] meshlabPath: " + meshlabPath)
    let colmapBatch = ""
    let commands = []

    // Create colmap batch file
    // 
    // Step 1: COLMAP photogrammetry
    // Step 2: pointcloud.py postprocessing point cloud
    // Step 3: meshlab ply -> stl
    // Step 4: stl -> bmps
    // 
    // commands[00] <- COLMAP feature_extractor
    // commands[01] <- COLMAP exhaustive_matcher
    // commands[02] <- COLMAP mapper
    // commands[03] <- COLMAP image_undistorter
    // commands[04] <- COLMAP patch_match_stereo
    // commands[05] <- COLMAP stereo_fusion
    // commands[06] <- pointcloud.py (thicken and inverse faces)
    // commands[07] <- meshlab (ply -> stl)
    // commands[08] <- slicing (TODO; stl -> bmps)
    // 
    // STEP 1
    // feature_extractor
    // NOTE: GPU is disabled in this step or it could crash
    colmapBatch = colmapExecPath + " feature_extractor"
    colmapBatch += " --database_path " + jpathw32(rmtProjPath, "database.db")
    colmapBatch += " --image_path " + jpathw32(rmtProjPath, "images")
    colmapBatch += " --SiftExtraction.use_gpu 0"
    commands.push(colmapBatch)
    // exhaustive_matcher
    colmapBatch = colmapExecPath + " exhaustive_matcher"
    colmapBatch += " --database_path " + jpathw32(rmtProjPath, "database.db")
    colmapBatch += " --SiftMatching.use_gpu 1"
    commands.push(colmapBatch)
    // mapper
    colmapBatch = colmapExecPath + " mapper"
    colmapBatch += " --database_path " + jpathw32(rmtProjPath, "database.db")
    colmapBatch += " --image_path " + jpathw32(rmtProjPath, "images")
    colmapBatch += " --output_path " + jpathw32(rmtProjPath, "sparse")
    commands.push(colmapBatch)
    // image_undistorter
    colmapBatch = colmapExecPath + " image_undistorter"
    colmapBatch += " --image_path " + jpathw32(rmtProjPath, "images")
    colmapBatch += " --input_path " + jpathw32(rmtProjPath, "sparse/0")
    colmapBatch += " --output_path " + jpathw32(rmtProjPath, "dense")
    colmapBatch += " --output_type COLMAP"
    colmapBatch += " --max_image_size 2000"
    commands.push(colmapBatch)
    // patch_match_stereo
    colmapBatch = colmapExecPath + " patch_match_stereo"
    colmapBatch += " --workspace_path " + jpathw32(rmtProjPath, "dense")
    colmapBatch += " --PatchMatchStereo.geom_consistency true"
    colmapBatch += " --PatchMatchStereo.num_iterations 4"
    colmapBatch += " --PatchMatchStereo.window_step 2"
    colmapBatch += " --PatchMatchStereo.gpu_index 0,1"
    colmapBatch += " --PatchMatchStereo.num_samples 10"
    commands.push(colmapBatch)
    // stereo_fusion
    colmapBatch = colmapExecPath + " stereo_fusion"
    colmapBatch += " --workspace_path " + jpathw32(rmtProjPath, "dense")
    colmapBatch += " --workspace_format COLMAP"
    colmapBatch += " --input_type geometric"
    colmapBatch += " --output_path " + jpathw32(rmtProjPath, "dense", "fused.ply")
    commands.push(colmapBatch)
    // 
    // STEP 2
    // pointcloud.py
    colmapBatch = "python " + jpathw32(colmapPath, "pointcloud.py") + " " + jpathw32(rmtProjPath, "dense", "fused.ply")
    commands.push(colmapBatch)
    // 
    // STEP 3
    // meshlab
    colmapBatch = jpath(meshlabPath, "meshlabserver.exe") + " -i " + jpathw32(rmtProjPath, "dense", "new_fused.ply") + " -o " + jpathw32(rmtProjPath, "dense", "new_fused.stl")
    commands.push(colmapBatch)
    // 
    // STEP 4
    // slicing

    var Client = require('ssh2').Client
    var conn = new Client()

    conn.on('ready', () => {
            // logMain("mkdir -p /" + rmtProjPath.replace(/:+/g, '').replace(/\\+/g, '/').replace(/ +/g, '\\ ') + "/{dense,sparse,images}")

            conn.exec("mkdir -p /" + rmtProjPath.replace(/:+/g, '').replace(/\\+/g, '/').replace(/ +/g, '\\ ') + "/{dense,sparse,images}", (err, stream) => {
                if (err) {
                    logMain("[WK_DLD] ssh2 - mkdir {dense,sparse,images} failed: " + err)
                }

                stream.on('close', (code, sig) => {
                    logMain("[WK_DLD] ssh2 - mkdir {dense,sparse,images} closed with code " + code + " and signal " + sig)
                    // conn.end()
                }).on('data', (d) => {
                    logMain("[WK_DLD] ssh2 - mkdir {dense,sparse,images} STDOUT: " + d)
                }).stderr.on('data', (d) => {
                    logMain("[WK_DLD] ssh2 - mkdir {dense,sparse,images} STDERR: " + d)
                })
            })
        })
        .connect({
            host: rmtIP,
            port: 22,
            username: 'tianyu',
            // ignoreErrors: true,
            // debug: logMain,
            privateKey: require('fs').readFileSync('C:\\Users\\Tianyu\\.ssh\\id_rsa')
        })

    conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                if (err) {
                    logMain("[WK_DLD] ssh2 - sftp failed: " + err)
                }

                glob(path.resolve(localPath, "./*.jpg"), (err, files) => {
                    const fprom = files.map(async file => {
                        const fstr = await sftp.fastPut(path.resolve(file), path.join(rmtImgPath, path.win32.basename(file)))
                    })

                    Promise.all(fprom).then(res => {
                        logMain("[WK_DLD] image transferred.")
                        // logMain(commands.toString())
                        ipcRenderer.send("worker-download-done", commands)

                    }).catch(e => {
                        logMain("[WK_DLD] image transfer error: " + e)
                    })
                    // for each file...
                    // for (let f in files) {
                    // 	logMain(path.resolve(files[f]) + " " + path.join(rmtImgPath, path.win32.basename(files[f])))

                    //     sftp.fastPut(path.resolve(files[f]), path.join(rmtImgPath, path.win32.basename(files[f])), (err) => {
                    //         if (err) {
                    //         	logMain("[WK_DLD] ssh2 - fastPut image failed: " + err)
                    //         } else {
                    //         	logMain("[WK_DLD] ssh2 - fastPut image: " + path.join(rmtImgPath, path.win32.basename(files[f])))
                    //         }
                    //     })
                    //     // Announce file transfer progress
                    // }
                })
            })
        })
        .connect({
            host: rmtIP,
            port: 22,
            username: 'tianyu',
            // ignoreErrors: true,
            // debug: logMain,
            privateKey: require('fs').readFileSync('C:\\Users\\Tianyu\\.ssh\\id_rsa')
        })

    conn.on('ready', () => {
        // TODO: testing only
        // !!!: remove before production
        // commands = ['exec /C/Users/Tianyu/Desktop/COLMAP-dev-windows/RUN_TESTS.bat']
        // commands = ['exec /C/Users/Tianyu/Desktop/COLMAP-dev-windows/TEST.bat "C:\\Users"']

        // conn.exec(commands[0], (err, stream) => {
        //     if (err) {
        //         logMain("!!!!!" + err)
        //     }

        //     stream.on('close', (code, sig) => {
        //         logMain("[WK_DLD] ssh2 - commands[0] closed with code " + code + " and signal " + sig)
        //         // conn.end()
        //     }).on('data', (d) => {
        //         logMain("[WK_DLD] ssh2 - commands[0] STDOUT: " + d)
        //     }).stderr.on('data', (d) => {
        //         logMain("[WK_DLD] ssh2 - commands[0] STDERR: " + d)
        //     })
        // })

        for (var i in commands) {
        	logMain(commands[i])
        	logMain("-")
        }
    }).connect({
        host: rmtIP,
        port: 22,
        username: 'tianyu',
        // ignoreErrors: true,
        // debug: logMain,
        privateKey: require('fs').readFileSync('C:\\Users\\Tianyu\\.ssh\\id_rsa')
    })


}

// Join path and parse with delimiter for batch files
const jpath = (...p) => {
    return path.join(...p)
        .replace(/\\+/g, '\\\\')
}

// Join path and parse with delimiter for batch files
const jpathw32 = (...p) => {
    return "\"" + path.join(...p) + "\""
}