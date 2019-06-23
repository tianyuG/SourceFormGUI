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

	var ident = name_f + "_" + t.getTime()
	var ident_t = "./" + ident
	var baseImagePath = path.resolve(remote.getGlobal('imagePath'))
	var absImagePath = path.resolve(baseImagePath, ident_t)
	// logMain(absImagePath)
	var currImageCount = parseInt(remote.getGlobal('numberOfImagesPerModel'))

	// Creating folder
	fs.mkdir(absImagePath, (err) => {
		if (err) { logMain("[WK_DLD]" + absImagePath + " creation failed: " + err) }
			else { logMain("[WK_DLD] created: " + absImagePath) }
	})

	// Update catalogue
	let jsonFile = fs.readFileSync(path.resolve(__dirname, "../carousel/content.json"));
	let jsonObj = JSON.parse(jsonFile)
	let jsonKeys = Object.keys(jsonObj)
	let lastIndex = jsonKeys[jsonKeys.length - 1]
	// logMain(lastIndex)
	let currIndex = (parseInt(lastIndex, 10) + 1).toString().padStart(4, '0')
	let currRecord = "{ \"title\": \"" + name_s + "\", \"sanitised_title\": \"" + name_f + "\", \"path\": \"" + absImagePath + "\", \"thumbnail\": " + currIndex + ".jpg\", \"updated\": \"" + t_iso + "\", \"accessed\": \"" + t_iso + "\", \"image_count\": " + currImageCount + ", \"display\": false }"
	// logMain(currRecord)
	jsonObj[currIndex] = currRecord
	// logMain(JSON.stringify(jsonObj))

	searchFor(name_s, "url_l", remote.getGlobal('numberOfImagesPerModel'))

})

/*
 * Search for the requested term and returns a json object with urls (among other things)
 * NOTE: This function expects a *sanitised* input
 * size (str): "url_sq", "url_s", "url_q", "url_t", "url_m", "url_n", "url_z", 
 * 						 "url_c", "url_l", "url_o"
 */
function searchFor(term, size, numOfImgs) {

}

// function downloadImages()