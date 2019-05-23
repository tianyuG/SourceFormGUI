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