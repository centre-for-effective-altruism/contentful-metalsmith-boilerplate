const minimatch = require('minimatch')
const debug = require('debug')('unprefix-pages')  // DEBUG=unprefix-pages
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * Unprefix Pages (Metalsmith plugin)
 *
 * Move pages from the /pages subfolder to the site root
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 *
 */
function unprefixPagesPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html'
  }
  const options = Object.assign(defaults, opts)
  // filter param can either be a glob string (passed to minimatch.filter) or a function suitable for Array.filter()
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function unprefixPages (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(files).filter(filter).forEach((file) => {
      // loop through a filtered subset of files...
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = unprefixPagesPlugin
// require this plugin in ./tasks/metalsmith using:
// const unprefixPages = require(paths.lib('metalsmith/plugins/unprefix-pages.js'))
