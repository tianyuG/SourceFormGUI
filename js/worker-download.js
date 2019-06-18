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

var flickr = new Flickr(require('electron')
		.remote.getGlobal('flickrKey'))

ipcRenderer.on('worker-download-search', (event, message) => {

})

/*
 * Search for the requested term and returns a json object with urls (among other things)
 * NOTE: This function expects a *sanitised* input
 * size (str): "url_sq", "url_s", "url_q", "url_t", "url_m", "url_n", "url_z", 
 * 						 "url_c", "url_l", "url_o"
 */
function searchFor(term, size, numOfImgs) {

}

function downloadImages()