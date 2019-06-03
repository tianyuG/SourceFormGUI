const { ipcRenderer, remote } = require('electron')
var Flickr = require('flickr-sdk')
var http = require('http');
var parse = require('url').parse;

/*
 * Flickr API
 */
// logDebug(require('electron').remote.getGlobal('flickrKey'));
// logDebug(require('electron').remote.getGlobal('flickrSecret'));

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
  // logDebug("RECV " + message)
  searchResult = message
  document.getElementById("preview-search-query").innerHTML = message

  var flickr = new Flickr(require('electron').remote.getGlobal('flickrKey'))

  var result = flickr.photos.search({
    text: message,
    extras: "url_n",
    privacy_filter: "1",
    safe_search: "3",
    per_page: "20"
  }).then(function(res) {
    // logDebug(JSON.stringify(res.body.photos))
    // console.log('yay!', res.body.photos.photo);
    // var gridItemCount = res.body.photos.photo.length > 9 ? 9 : res.body.photos.photo.length
    // var gridId = []
    // var gridURL = []
    // for (i = 0; i < gridItemCount; i++) {
    //   logDebug(JSON.stringify(res.body.photos.photo[i]))

    // if (res.body.photos.photo[i] != null) {
    // 	gridURL.push(())
    // }

    // https://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}.jpg

    // gridImages[i] = res.body.photos.photo[i].id
    // gridId.push(res.body.photos.photo[i].id)
    // gridURL.push(flickr.photos.getSizes({
    // 	api_key: require('electron').remote.getGlobal('flickrKey'),
    // 	photo_id: res.body.photos.photo[i].id
    // }))
    // logDebug(JSON.stringify(res.body.photos.photo))
    populateGrid(res.body.photos.photo)
  }).catch(function(err) {
    console.error('bonk', err);
  });
})

const abortButton = document.getElementById("preview-no")

abortButton.addEventListener('click', function() {
  ipcRenderer.send('preview-aborted', searchResult)
})

async function getPhotoPreviewURLs(query) {
  try {
    var result = flickr.photos.search({
      text: query
    })
  } catch (ret) {
    logDebug("Preview error: " + ret)
  }

}

// Construct the URL to a flickr image based on res.body.photos.photo
// PARAMETERS
// photo: (obj) An Flickr.photos.photo object
// size: (str, opt) Desired size of the returned image URL.
// 			 "", or anything not listed below - do not specify size (default value)
//			 "s" - 75x75 square
//			 "q" - 150x150 square
//			 "t" - thumbnail (100 on longest)
//			 "m" - small (240 on longest)
//			 "n" - small (320 on longest)
//			 "-" - medium (500 on longest)
//			 "z" - medium (640 on longest)
//			 "c" - medium (800 on longest^)
//			 "b" - large (1024 on longest^)
//			 "h" - large (1600 on longest^)
// 			 "k" - large (2048 on longest^)
//			 "o" - original
// 			 ^ denotes this format may not be available for older (pre-2010) photos.
//			 ^^ denotes this format may not be available for older (pre-2012) photos.
//			 Refer to Flickr API doc on misc.urls for more information.
//			 https://www.flickr.com/services/api/misc.urls.html
//// Images on the modelling computer seem to have 640 on longest
// RETURNS
// a string that contains the actual url (https) to the image at the requested size.
// NOTES
// - To use this function with an array of Flickr.photos.photo, use map()
// - For original images, it can be in jpg, gif, or png format.
function constructFlickrImageURL(photo, size = "") {
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

function populateGrid(photos) {
  // logDebug(JSON.stringify(photos))
  var count = 0
  for (var i = 0; i < 20; i++) {
    if (count < 9 && (photos[i].farm != 0 || photos[i].server != "0")) {
      var el = document.createElement('img')
      logDebug(JSON.stringify(photos[i]))
      el.src = constructFlickrImageURL(photos[i], "n")
      el.id = "grid-item-" + i
      document.getElementById("preview-grid").appendChild(el)
      count++
    }
  }
}