const { ipcRenderer, remote } = require('electron')
var Flickr = require('flickr-sdk')
var http = require('http');
var parse = require('url').parse;

/*
 * Flickr API
 */
logDebug(require('electron').remote.getGlobal('flickrKey'));
logDebug(require('electron').remote.getGlobal('flickrSecret'));

var searchResult = ""

// var flickr = new Flickr(require('electron').remote.getGlobal('flickrKey'))

// var result = flickr.photos.search({
//   text: 'doggo'
// }).then(function (res) {
//   console.log('yay!', res.body.photos.photo);
// }).catch(function (err) {
//   console.error('bonk', err);
// });

ipcRenderer.once('search-query-relay', (event, message) => {
  logDebug("RECV " + message)
  searchResult = message
  document.getElementById("preview-search-query").innerHTML = message

  var flickr = new Flickr(require('electron').remote.getGlobal('flickrKey'))

  var result = flickr.photos.search({
    text: message
  }).then(function(res) {
    console.log('yay!', res.body.photos.photo);
  }).catch(function(err) {
    console.error('bonk', err);
  });

})

const abortButton = document.getElementById("preview-no")

abortButton.addEventListener('click', function() {
  ipcRenderer.send('preview-aborted', searchResult)
})