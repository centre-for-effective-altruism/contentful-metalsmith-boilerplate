const minimatch = require('minimatch')
const debug = require('debug')('favicons')  // DEBUG=favicons
const paths = require('../../helpers/file-paths') // helper to get build system paths
const favicons = require('favicons')

/**
 * Favicons (Metalsmith plugin)
 *
 * Generate favicons for your site
 *
 * @param {string|Array} source - path to source file in Metalsmith or array of sourcefile paths
 * @param {Object} config - configuration options passed directly to `favicons`
 *
 */
function faviconsPlugin (source, config) {
  // main plugin returned to Metalsmith
  if (typeof source === 'string') source = [source]
  return function favicons (files, metalsmith, done) {
    // get file buffers
    const icons = []
    source.forEach((filePath) => {
      icons.push(files['filepath'].contents)
    })
    if (icons.length) {
      favicons(icons, config, (err, data) => {
        if (err) {
          throw err
        }
        // add all static stuff to the build
        data.files.forEach((file) => {
          files[file.name] = { contents: file.contents }
        })
        data.images.forEach((image) => {
          files[image.name] = { contents: image.contents }
        })
        // add HTML strings to Metalsmith metadata so we can access them in templates
        metalsmith.metadata().favicons = data.html
      })
    }

    done()
  }
}

module.exports = faviconsPlugin
// require this plugin in ./tasks/metalsmith using:
// const favicons = require(paths.lib('metalsmith/plugins/favicons.js'))
