// PurifyCSS - Run CSS Files Through PurifyCSS, Testing Against The Whole Build's HTML/JS Files
const minimatch = require('minimatch')
const debug = require('debug')('purifycss')  // DEBUG=purifycss
const purify = require('purify-css')

function purifyCSSPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.@(html|js)',
    whitelist: [],
    minify: false,
    cssFiles: 'styles/app.min.css'
  }
  const options = Object.assign(defaults, opts)
  options.cssFiles = typeof options.cssFiles === 'string' ? [options.cssFiles] : options.cssFiles
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter

  // main plugin returned to Metalsmith
  return function purifyCSS (files, metalsmith, done) {
    // put all HTML / JS files into a single string
    const html = Object.keys(files).filter(filter).map((file) => files[file].contents.toString()).join('\n')

    // loop through each CSS file and test against HTML
    options.cssFiles.forEach((cssFile) => {
      // purify!
      debug('Purifying %s', cssFile)
      files[cssFile].contents = new Buffer(purify(html, files[cssFile].contents.toString(), {
        whitelist: options.whitelist,
        minify: options.minify
      }))
    })

    done()
  }
}

module.exports = purifyCSSPlugin
// require this plugin in ./tasks/metalsmith using:
// const purifyCSS = require(paths.lib('metalsmith/plugins/purifycss.js'))
