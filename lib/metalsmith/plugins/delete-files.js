const minimatch = require('minimatch')
const debug = require('debug')('delete-files')  // DEBUG=delete-files
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * Delete Files (Metalsmith plugin)
 *
 * Deletes files matching files from the build
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 *
 */
function deleteFilesPlugin (opts) {
  const defaults = {
    filter: false
  }
  const options = Object.assign(defaults, opts)
  let filter = options.filter
  return function deleteFiles (files, metalsmith, done) {
    if (filter) {
      filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
      Object.keys(files).filter(filter).forEach((file) => {
        debug('Deleting file: %s', file)
        delete files[file]
      })
    }
    done()
  }
}

module.exports = deleteFilesPlugin
// require this plugin in ./tasks/metalsmith using:
// const deleteFiles = require(paths.lib('metalsmith/plugins/delete-files.js'))
