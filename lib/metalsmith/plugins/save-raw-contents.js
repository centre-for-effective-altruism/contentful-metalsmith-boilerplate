const minimatch = require('minimatch')
const debug = require('debug')('save-raw-contents')  // DEBUG=save-raw-contents
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * Save Raw Contents (Metalsmith plugin)
 *
 * Copies file HTML so that it's possible to use the HTML body of linked files without it being recursively templated
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 * @param {string}          opts.field - the name of the field to save the raw HTML to
 *
 */
function saveRawContentsPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html',
    field: 'rawContents'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  return function saveRawContents (files, metalsmith, done) {
    Object.keys(files).filter(filter).forEach((file) => {
      debug('Copying HTML contents of %s to the %s key', file, options)
      files[file][options.field] = files[file].contents
    })
    done()
  }
}

module.exports = saveRawContentsPlugin
// require this plugin in ./tasks/metalsmith using:
// const saveRawContents = require(paths.lib('metalsmith/plugins/save-raw-contents.js'))
