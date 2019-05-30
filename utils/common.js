// Format debug log
function logDebug(arg) {
  var timestamp = new Date()
  if (require('electron').remote.getGlobal('isInDebugEnv')) {
    console.log("[DEBUG:" + timestamp.getFullYear() +
      String(timestamp.getMonth() + 1).padStart(2, '0') +
      String(timestamp.getDate()).padStart(2, '0') + "@" +
      String(timestamp.getHours()).padStart(2, '0') + ":" +
      String(timestamp.getMinutes()).padStart(2, '0') + ":" +
      String(timestamp.getSeconds()).padStart(2, '0') + "." +
      String(timestamp.getMilliseconds()).padStart(3, 0) + "] " + arg)
  }
}

// Concatenate string (array) `arr` with string `ch`
// If `arr` is a string array with two or more elements, combine each of the 
// elements with `ch` in between. If `arr` is a string or a stirng array with 
// one element, returns `arr`
// EXAMPLE
// concatWith(["1", "2", "3"], ", ") // Returns "1, 2, 3"
// concatWith("1", ", ") // Returns "1"
// concatWith(["1"], ", ") // Returns "1"

function concatWith(arr, ch) {
  ret = ""

  if (arr != null && Array.isArray(arr)) {
    for (var i = 0; i < arr.length; i++) {
      ret += arr
      if (i < arr.length - 1) { ret += ch }
    }
} else { ret = arr }

  return ret
}
