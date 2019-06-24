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
var fs = require('graceful-fs')

var flickr = new Flickr(require('electron')
	.remote.getGlobal('flickrKey'))

ipcRenderer.on('worker-download-search', (event, message) => {
	var t = new Date()
	var t_iso = t.toISOString()
	var name_o = message.trim()
	var name_s = purify.sanitize(name_o)
	var name_f = name_s.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/\\+/g, '')

	var ident = name_f + "_" + t.getTime()
	var ident_t = "./" + ident
	var baseImagePath = path.resolve(remote.getGlobal('imagePath')
		.toString())
	var absImagePath = path.resolve(baseImagePath, ident_t)
	// logMain(absImagePath)
	var currImageCount = parseInt(remote.getGlobal('numberOfImagesPerModel'))

	// Creating folder
	fs.mkdir(absImagePath, (err) => {
		if (err) {
			logMain("[WK_DLD] " + absImagePath + " creation failed: " + err)
		} else {
			logMain("[WK_DLD] created: " + absImagePath)
		}
	})

	// Update catalogue
	let jsonFile = fs.readFileSync(path.resolve(__dirname, "../carousel/content.json"));
	let jsonObj = JSON.parse(jsonFile)
	let jsonKeys = Object.keys(jsonObj)
	let lastIndex = jsonKeys[jsonKeys.length - 1]
	// logMain(lastIndex)
	let currIndex = (parseInt(lastIndex, 10) + 1)
		.toString()
		.padStart(4, '0')
	let currRecord = "{ \"title\": \"" + name_s + "\", \"sanitised_title\": \"" + name_f + "\", \"path\": \"" + absImagePath.replace(/\\+/g, "\\\\") + "\", \"thumbnail\": \"" + currIndex + ".jpg\", \"updated\": \"" + t_iso + "\", \"accessed\": \"" + t_iso + "\", \"image_count\": " + currImageCount + ", \"display\": false }"
	logMain(currRecord)
	jsonObj[currIndex] = JSON.parse(currRecord)
	// jsonObj[currIndex] = currRecord

	fs.writeFile(path.resolve(__dirname, "../carousel/content.json"), JSON.stringify(jsonObj, null, 2), (err) => {
		if (err) {
			logMain("[WK_DLD] Could not update catalogue: " + err)
		}
	});

	// Search for images
	var results = []
	var resultsCount = 0
	var perPage = require('electron')
		.remote.getGlobal('imagesPerPage')
	var pagesNeeded = parseInt(currImageCount / perPage) + 2
	for (var i = 0; i < pagesNeeded; i++) {
		var result = flickr.photos.search({
				text: name_s,
				extras: "url_n, owner_name, description, license",
				privacy_filter: 1,
				safe_search: 3,
				sort: "relevance",
				per_page: perPage,
				page: i
			})
			.then(function(res) {
				resultsCount += Object.keys(res.body.photos.photo)
					.length
				logDebug(JSON.stringify(res.body))
				logDebug("[WK_DLD] number of images downloaded: " + resultsCount)
				pageIndex = res.body.photos.page
				var manifestRelPath = "./manifest_" + pageIndex + ".json"
				logMain(manifestRelPath)
				fs.writeFile(path.resolve(absImagePath, manifestRelPath), JSON.stringify(res.body.photos, null, 2), (err) => {
					if (err) {
						logMain("[WK_DLD] Could not update manifest: " + err)
					}
				})
			})
			.catch(function(err) {
				logMain("[WK_DLD] image download failed: " + err);
			});
	}

})
