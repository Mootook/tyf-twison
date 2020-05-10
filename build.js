const fs = require('fs')
const Uglify = require('uglify-js')
const childProcess = require('child_process')
const exec = childProcess.exec

const package = JSON.parse(fs.readFileSync("package.json", "utf-8"))
const html = fs.readFileSync("src/storyFormat.html", "utf-8")
const js = Uglify.minify("src/twison.js")

html = html.replace("{{SCRIPT}}", js.code)

const outputJSON = {
  name: package.name,
  version: package.version,
  author: package.author,
  description: package.description,
  proofing: false,
  source: html
};

const outputString = "window.storyFormat(" + JSON.stringify(outputJSON, null, 2) + ");";
fs.writeFile("dist/format.js", outputString, function(err) {
  if (err) { 
    console.log("Error building story format:", err);
  } else {

		if (process.platform !== 'darwin') {
			const srcdir = `"${__dirname}\\dist\\format.js"`
			const targetdir = `"c:\\program files\\tweego\\story-formats\\tyf\\format.js"`
			const cmd = `copy ${srcdir} ${targetdir}` 
			exec(cmd, (err, stdout, stderr) => {
				console.log('Rebuilt and copied to', targetdir)
			})
		}

    console.log("successfully built story format to dist/format.js");
  }
});
