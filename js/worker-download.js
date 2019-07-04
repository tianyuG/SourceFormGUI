/*
 * Download worker assumes that either the search term is unique, or the user
 * has agreed to redownload (update) an existing image set
 */

const {
	ipcRenderer,
	remote
} = require('electron')
var Flickr = require('flickr-sdk')
var http = require('http');
var parse = require('url')
	.parse;
var purify = require('dompurify')
var path = require("path")
var fs = require('fs')
	.promises
var ssh = require('ssh2')
var glob = require('glob')

var flickr = new Flickr(require('electron')
	.remote.getGlobal('flickrKey'))

ipcRenderer.on('worker-download-search', async (event, message) => {
	var t = new Date()
	var t_iso = t.toISOString()
	var name_o = message.trim()
	var name_s = purify.sanitize(name_o)
	var name_f = name_s.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/\\+/g, '')
		.replace(/\"+/g, '')

	var ident = name_f + "_" + t.getTime()
	var ident_t = "./" + ident
	var baseImagePath = path.resolve(remote.getGlobal('imagePath')
		.toString())
	var absImagePath = path.resolve(baseImagePath, ident_t)
	logMain(absImagePath)
	var currImageCount = parseInt(remote.getGlobal('numberOfImagesPerModel'))

	// Creating folder
	await fs.mkdir(absImagePath)

	let jsonFile = await fs.readFile(path.resolve(__dirname, "../carousel/content.json"))
	let jsonObj = JSON.parse(jsonFile)
	let jsonKeys = Object.keys(jsonObj)
	let lastIndex = jsonKeys[jsonKeys.length - 1]
	// logMain(lastIndex)
	let currIndex = (parseInt(lastIndex, 10) + 1)
		.toString()
		.padStart(4, '0')

	// Populate manifest with search results
	var results = []
	var imageSize = require('electron')
		.remote.getGlobal("imageSize")
	var perPage = require('electron')
		.remote.getGlobal('imagesPerPage')
	// It is possible for flickr not to return an url because it does not have 
	// the size required. The extraPageCount is used to get more images than 
	// required so it would not be off by too much. The lowest it can go should
	// be 1.
	var extraPageCount = require('electron')
		.remote.getGlobal("extraPageCount")
	results = await populateManifest(currImageCount, perPage, name_s, imageSize, absImagePath, extraPageCount)

	// Update catalogue
	let currRecord = "{ \"title\": \"" + name_s.replace(/\"+/g, "\\\"") + "\", \"sanitised_title\": \"" + name_f + "\", \"path\": \"" + absImagePath.replace(/\\+/g, "\\\\") + "\", \"thumbnail\": \"" + currIndex + ".jpg\", \"updated\": \"" + t_iso + "\", \"accessed\": \"" + t_iso + "\", \"image_count\": " + results.length + ", \"display\": false }"
	logMain(currRecord)
	jsonObj[currIndex] = JSON.parse(currRecord)
	await fs.writeFile(path.resolve(__dirname, "../carousel/content.json"), JSON.stringify(jsonObj, null, 2))
	// logMain(JSON.stringify(results))

	ipcRenderer.send('image-download-request', {
		url: results,
		properties: {
			directory: absImagePath,
		}
	})
})

/*
 * Async function to fetch manifest list from flickr
 */
const populateManifest = async (currImageCount, perPage, name_s, imageSize, absImagePath, extraPageCount) => {
	var resultsCount = 0
	var pagesNeeded = parseInt(currImageCount / perPage) + extraPageCount
	var res = []
	var promises = []
	var urls = []

	for (var i = 1; i < pagesNeeded; i++) {
		var result = flickr.photos.search({
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

	for (var resobj in res) {
		pageIndex = res[resobj].body.photos.page
		var manifestRelPath = "./manifest_" + pageIndex + ".json"
		await fs.writeFile(path.resolve(absImagePath, manifestRelPath), JSON.stringify(res[resobj].body.photos, null, 2))
		// logDebug(JSON.stringify(res[resobj].body.photos.photo))
		for (var imgobj in res[resobj].body.photos.photo) {
			// logDebug(JSON.stringify(res[resobj].body.photos.photo[imgobj][imageSize]))
			var ret = res[resobj].body.photos.photo[imgobj][imageSize]
			if (typeof ret != "undefined") {
				urls.push(ret)
			}
		}
	}

	// var urlsRelPath = "./urls" + urls.length + ".json"
	var urlsRelPath = "./" + imageSize + ".json"
	await fs.writeFile(path.resolve(absImagePath, urlsRelPath), JSON.stringify(urls, null, 2))
	return urls
}

const transferToRemote = async (projectName, localPath) => {
	var remoteIp = require('electron')
		.remote.getGlobal('remoteIP')
	var remotePath = require('electron')
		.remote.getGlobal

	var Client = ssh.Client()
	var conn = new Client()

	conn.on('ready', () => {
		logDebug('[WK-DLD] ssh2 client ready for project ' + projectName + ".")

		conn.on('ready', () => {
				conn.sftp((err, sftp) => {
					if (err) {
						logMain("[WK-DLD] ssh2 - sftp failed: " + err)
					}

					var rmtProjPath = path.resolve(require('electron')
						.remote.getGlobal('remotePath'), "./" + projectName)
					sftp.mkdir(rmtProjPath, (err) => {
						logMain("[WK-DLD] ssh2 - mkdir project folder failed: " + err)
					})
					sftp.mkdir(path.resolve(rmtProjPath, "./sparse"), (err) => {
						logMain("[WK-DLD] ssh2 - mkdir sparse folder failed: " + err)
					})
					sftp.mkdir(path.resolve(rmtProjPath, "./dense"), (err) => {
						logMain("[WK-DLD] ssh2 - mkdir dense folder failed: " + err)
					})

					logMain("[WK-DLD] ssh2 - folders created.")

					glob(path.parse(localPath).dir + "\\*.jpg", (err, files) => {
						// for each file...
					})
				})
			})
			.connect({
				host: require('electron')
					.remote.getGlobal('remoteIP'),
				port: 22,
				username: 'SourceForm',
				privateKey: require('fs')
					.fs.readFileSync(path.resolve(__dirname, "./configs/id_rsa"));
			})
	})
}