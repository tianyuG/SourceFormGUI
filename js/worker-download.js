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
	let currRecord = "{ \"title\": \"" + name_s + "\", \"sanitised_title\": \"" + name_f + "\", \"path\": \"" + absImagePath.replace('\\', "\\\\") + "\", \"thumbnail\": \"" + currIndex + ".jpg\", \"updated\": \"" + t_iso + "\", \"accessed\": \"" + t_iso + "\", \"image_count\": " + currImageCount + ", \"display\": false }"
	logMain(currRecord)
	// jsonObj[currIndex] = JSON.parse(currRecord)
	jsonObj[currIndex] = currRecord

	// logMain(JSON.stringify(jsonObj))

	fs.writeFile(path.resolve(__dirname, "../carousel/content.json"), JSON.stringify(jsonObj, null, 2), (err) => {
		if (err) {
			logMain("[WK_DLD] Could not update catalogue: " + err)
		}
	});

	// Search for images
	var results = []
	var promises = []
	var resultsCount = 0
	var perPage = require('electron')
		.remote.getGlobal('imagesPerPage')
	for (var i = 0; i < currImageCount + perPage; i += perPage) {
		logMain("// " + i + " " + parseInt(i / 100))
		// var tst = test(name_s, perPage, i % 100)
		// logDebug(tst.toString())
		// promises.push(tst)
		var result = flickr.photos.search({
				text: name_s,
				extras: "url_n, owner_name, description, license",
				privacy_filter: 1,
				safe_search: 3,
				sort: "relevance",
				per_page: perPage,
				page: parseInt(i / 100)
			})
			.then(writeTo(i))
			// .then(function(res) {
			// 	results.push(res)
			// })
			.catch(function(err) {
				logMain("[WK_DLD] image download failed: " + err);
			});

		// 	})
		// 	.then(function(res) {
		// 		// logDebug(JSON.stringify(res.body.photos))
		// 		// results.push(JSON.stringify(res.body.photos))
		// 	})
		// .then(function(res) {
		// 	// logDebug(JSON.stringify(res.body.photos))
		// 	logMain((i)
		// 		.toString() + "   " + (i / 100)
		// 		.toString())
		// 	resultsCount += Object.keys(res.body.photos.photo)
		// 		.length
		// 	logDebug("[WK_DLD] number of images downloaded:" + resultsCount)
		// 	var manifestRelPath = "./manifest_" + (i / 100)
		// 		.toString() + ".json"
		// 	logMain(manifestRelPath)
		// 	fs.writeFile(path.resolve(absImagePath, manifestRelPath), JSON.stringify(res.body.photos, null, 2), (err) => {
		// 		if (err) {
		// 			logMain("[WK_DLD] Could not update manifest: " + err)
		// 		}
		// 	})
		// })
		// .catch(function(err) {
		// 	logMain("[WK_DLD] image download failed: " + err);
		// });
		// results.push(result)
		// logMain(JSON.stringify(results))
	}

	logMain(JSON.stringify(promises))

	// Promise.all(promises)
	// 	.then(function(res) {
	// 		logDebug(JSON.stringify(res.body.photos))
	// 		logMain((i)
	// 			.toString() + "   " + (i / 100)
	// 			.toString())
	// 		resultsCount += Object.keys(res.body.photos.photo)
	// 			.length
	// 		logDebug("[WK_DLD] number of images downloaded:" + resultsCount)
	// 		var manifestRelPath = "./manifest_" + (i / 100)
	// 			.toString() + ".json"
	// 		logMain(manifestRelPath)
	// 		fs.writeFile(path.resolve(absImagePath, manifestRelPath), JSON.stringify(res.body.photos, null, 2), (err) => {
	// 			if (err) {
	// 				logMain("[WK_DLD] Could not update manifest: " + err)
	// 			}
	// 		})

	// 	})
	// 	.catch(function(err) {
	// 		if (err) {
	// 			logMain("[WK_DLD] image download failed: " + err);
	// 		}
	// 	})

	// Download images

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

// function processManifest()
// 
const test = async (message, perPage, pageid) => {
	await flickr.photos.search({
		text: message,
		extras: "url_n, owner_name, description, license",
		privacy_filter: 1,
		safe_search: 3,
		sort: "relevance",
		per_page: perPage,
		page: pageid
	})
}

async function writeTo(i) {
	// logDebug(JSON.stringify(res.body.photos))
	logMain((i)
		.toString() + "   " + (i / 100)
		.toString())
	resultsCount += Object.keys(res.body.photos.photo)
		.length
	var manifestRelPath = "./manifest_" + (i / 100)
		.toString() + ".json"
	logMain(manifestRelPath)
	fs.writeFile(path.resolve(absImagePath, manifestRelPath), JSON.stringify(res.body.photos, null, 2), (err) => {
		if (err) {
			logMain("[WK_DLD] Could not update manifest: " + err)
		}
	})
}