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
	var t = Date.now()
	var name_o = message.trim()
	var name_s = purify.sanitize(name_o)
	var name_f = name_s.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')

	var ident = name_f + "_" + t
	var ident_t = "./" + ident
	var baseImagePath = path.resolve(remote.getGlobal('imagePath'))
	var absImagePath = path.resolve(baseImagePath, ident_t)
	logMain(absImagePath)

	fs.mkdirSync(absImagePath)
		.then(logMain("[WKR-DL] " + absImagePath + " created."))
		.catch(err => {
			logMain(absImagePath + " creation failed: " + err)
		})

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