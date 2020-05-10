var watch = require('watch')
var childProcess = require('child_process');
const path = require('path')
console.log("Watching src directory for changes...");

watch.watchTree(__dirname + '/src', function (f, curr, prev) {
  if (prev) {
    console.log("change detected, rebuilding.")
  }
	childProcess.fork(__dirname + '/build.js');
});