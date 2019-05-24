const { ipcRenderer, remote } = require('electron')
var Flickr = require('flickr-sdk')
var http = require('http');
var parse = require('url').parse;

/*
 * Flickr API
 */
logDebug(require('electron').remote.getGlobal('flickrKey'));
logDebug(require('electron').remote.getGlobal('flickrSecret'));

var flickr = new Flickr(require('electron').remote.getGlobal('flickrKey'))

var result = flickr.photos.search({
  text: 'doggo'
}).then(function (res) {
  console.log('yay!', res.body.photos.photo);
}).catch(function (err) {
  console.error('bonk', err);
});