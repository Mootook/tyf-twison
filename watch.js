var watch = require('watch')
var childProcess = require('child_process');
const path = require('path')
console.log("Watching src directory for changes...");

watch.watchTree(__dirname + '/src', function (f, curr, prev) {
  if (prev) {
    console.log("Change detected, rebuilding.")
  }
	childProcess.fork(__dirname + '/build.js');
	
	if (process.platform !== 'darwin') {
		const exec = childProcess.exec

		const cmd = (
			`copy "${__dirname}\\dist\\format.js" "C:\\Users\\Alex Mutuc\\Desktop\\format.js"`
			// "touch 'C:\\Users\\Alex Mutuc\\Desktop\\test.js'"
		)
		const dir = path.resolve(`${__dirname}/../../../`)
		console.log(__dirname)
		exec(cmd, { cwd: dir }, (err, stdout, stderr) => {
			console.log("error", err)
			console.log("stdout", stdout)
			console.log('stderr', stderr)
			console.log('Done.')
		})
	}
});