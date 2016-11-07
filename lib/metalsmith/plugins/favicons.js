const debug = require('debug')('favicons')  // DEBUG=favicons
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
  if (typeof source !== 'string') throw new TypeError('favicon source file must be a string')
  return function _favicons (files, metalsmith, done) {
    if (!files[source]) throw new TypeError(`Favicon source file ${source} does not exist in the Metalsmith build`)
    // get file buffer
    const iconFile = files[source].contents
    debug('Creating favicons from source %s', source)
    favicons(iconFile, config, (err, data) => {
      if (err) {
        throw err
      }
      debug('Favicons created successfully')
      // add all static stuff to the build
      data.files.forEach((file) => {
        debug('Adding file %s to the build', file.name)
        files[file.name] = { contents: file.contents }
      })
      data.images.forEach((image) => {
        debug('Adding image %s to the build', image.name)
        files[image.name] = { contents: image.contents }
      })
      // add HTML strings to Metalsmith metadata so we can access them in templates
      metalsmith.metadata().favicons = data.html.join('\n')
      done()
    })
  }
}

module.exports = faviconsPlugin
// require this plugin in ./tasks/metalsmith using:
// const favicons = require(paths.lib('metalsmith/plugins/favicons.js'))
