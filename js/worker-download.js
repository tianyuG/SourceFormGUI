const { ipcRenderer, remote } = require('electron')
var Flickr = require('flickr-sdk')
var http = require('http');
var parse = require('url').parse;

var flickr = new Flickr(require('electron').remote.getGlobal('flickrKey'))

ipcRenderer.on('worker-download-search', (event, message) => {


})