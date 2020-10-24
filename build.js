const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const package = JSON.parse(fs.readFileSync("package.json", "utf-8"))
let html = fs.readFileSync("src/storyFormat.html", "utf-8")
const Terser = require('terser')
const jsFile = fs.readFileSync('src/twison.js', 'utf8')
const js = Terser.minify(jsFile)
html = html.replace('{{SCRIPT}}', js.code)

const outputJSON = {
  name: package.name,
  version: package.version,
  author: package.author,
  description: package.description,
  proofing: false,
  source: html
};
const outputString = "window.storyFormat(" + JSON.stringify(outputJSON, null, 2) + ");";
/**
 * When formatter is rebuilt/minimized, overwrite 
 * the previous build in the tweego story-formats directory.
 */
fs.writeFile("dist/format.js", outputString, function(err) {
  if (err) { 
    console.log("Error building story format:", err);
  } else {
    const srcdir = process.platform == 'darwin'
      ? `${path.resolve('./dist/format.js')}`
      : `"${__dirname}\\dist\\format.js"`
    const targetdir = process.platform == 'darwin'
      ? `${path.resolve('../tweego/storyformats/tyf/format.js')}`
      :`"c:\\program files\\tweego\\story-formats\\tyf\\format.js"`
    const cmd = `${process.platform == 'darwin' ? 'cp' : 'copy'} ${srcdir} ${targetdir}` 
    childProcess.exec(cmd, (err, stdout, stderr) => {
      console.log(`Rebuilt ${srcdir} and copied to ${targetdir}`)
    })
  }
});
