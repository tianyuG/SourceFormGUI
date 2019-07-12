const {
	ipcRenderer,
	remote
} = require('electron')
const Flickr = require('flickr-sdk')
const http = require('http');
const parse = require('url')
	.parse;
const purify = require('dompurify')
const fs = require('fs')
	.promises
const path = require("path")

/*
 * Flickr API
 */
let searchResult = ""

ipcRenderer.once('search-query-relay', async (event, message) => {
	searchResult = message
	document.getElementById("preview-search-query")
		.innerHTML = message

	let ret = await checkAgainstExisting(message)

	if (ret.length > 0) {
		let nid = ret[0].id
		let ndate = ret[0].updated

		for (let entry in ret) {
			if (Date.parse(ret[entry].updated) > ndate) {
				nid = ret[entry].id
				ndate = ret[entry].updated
			}
		}
		document.getElementById("preview-ysf")
			.innerHTML = "You searched for:"
	}

	let flickr = new Flickr(require('electron')
		.remote.getGlobal('flickrKey'))

	let result = flickr.photos.search({
			text: message,
			extras: "url_n, owner_name, description, license",
			privacy_filter: 1,
			safe_search: 3,
			sort: "relevance",
			per_page: 20
		})
		.then(function(res) {
			// logDebug(JSON.stringify(res.body.photos))
			populateGrid(res.body.photos.photo)
		})
		.catch(function(err) {
			logMain("[SPREV] image preview failed: " + err);
		});
})

const abortButton = document.getElementById("preview-no")
const continueButton = document.getElementById("preview-yes")

abortButton.addEventListener('click', function() {
	ipcRenderer.send('preview-aborted', searchResult)
})

continueButton.addEventListener('click', function() {
	// logMain("TO-DELEGATE")
	ipcRenderer.send('worker-download-search-r', searchResult)
})

// async function getPhotoPreviewURLs(query) {
// 	try {
// 		var result = flickr.photos.search({
// 			text: query
// 		})
// 	} catch (ret) {
// 		logDebug("Preview error: " + ret)
// 	}
// }

// Construct the URL to a flickr image based on res.body.photos.photo
// PARAMETERS
// photo: (obj) An Flickr.photos.photo object
// size: (str, opt) Desired size of the returned image URL.
//       "", or anything not listed below - do not specify size (default value)
//       "s" - 75x75 square
//       "q" - 150x150 square
//       "t" - thumbnail (100 on longest)
//       "m" - small (240 on longest)
//       "n" - small (320 on longest)
//       "-" - medium (500 on longest)
//       "z" - medium (640 on longest)
//       "c" - medium (800 on longest^)
//       "b" - large (1024 on longest^)
//       "h" - large (1600 on longest^)
//       "k" - large (2048 on longest^)
//       "o" - original
//       ^ denotes this format may not be available for older (pre-2010) photos.
//       ^^ denotes this format may not be available for older (pre-2012) photos.
//       Refer to Flickr API doc on misc.urls for more information.
//       https://www.flickr.com/services/api/misc.urls.html
//// Images on the modelling computer seem to have 640 on longest
// RETURNS
// a string that contains the actual url (https) to the image at the requested size.
// NOTES
// - To use this function with an array of Flickr.photos.photo, use map()
// - For original images, it can be in jpg, gif, or png format.
const constructFlickrImageURL = (photo, size = "") => {
	if (["s", "q", "t", "m", "n", "-", "z", "c", "b", "h", "k"].includes(size)) {
		// scaled images
		// format: https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
		return "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_" + size + ".jpg"
	} else if (["o"].includes(size)) {
		// special case for original image
		// TODO: NOT IMPLEMENTED. 
		// Flickr.photos.search needs the 
	} else {
		// size not specified
		// format: https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
		return "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg"
	}
}

const populateGrid = (photos) => {
	// logDebug(JSON.stringify(photos))
	let count = 0
	for (let i = 0; i < 20; i++) {
		if (count < 8 && (photos[i].farm != 0 || photos[i].server != "0")) {
			// let el = document.createElement('img')
			// // logDebug(JSON.stringify(photos[i]))
			// el.src = constructFlickrImageURL(photos[i], "n")
			// el.id = "grid-item-" + i
			// document.getElementById("preview-grid")
			// 	.appendChild(el)
			let el = document.createElement('span')
			el.style.backgroundImage = "url(\'" + constructFlickrImageURL(photos[i], "n") +"\')"
			el.id = "grid-item-" + i
			document.getElementById("preview-grid")
				.appendChild(el)
			count++
		}
	}
}

/*
 * Check search term against existing models
 */
const checkAgainstExisting = async (term) => {
	const sanitised = purify.sanitize(term)
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
	logDebug(sanitised)

	let jsonObj = JSON.parse(await fs.readFile(path.resolve(__dirname, "../carousel/content.json")));
	// logDebug(JSON.stringify(jsonObj))
	let retArr = []

	for (let entry in jsonObj) {
		logDebug(JSON.stringify(jsonObj[entry]))
		if (jsonObj[entry].sanitised_title == sanitised) {
			logDebug("FOUND json entry")
			retArr.unshift({
				"id": entry,
				"path": jsonObj[entry].path,
				"updated": jsonObj[entry].updated
			})
		}
	}
	logDebug(JSON.stringify(retArr))
	return retArr
}