const minimatch = require('minimatch')
const debug = require('debug')('add-canonical-urls')  // DEBUG=add-canonical-urls
const paths = require('../../helpers/file-paths') // helper to get build system paths
const site = require(paths.helpers('site-information'))
/**
 * Add Canonical URLs (Metalsmith plugin)
 *
 * Adds canonical URLs based on site metadata and item path
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 *
 */
function addCanonicalUrlsPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  return function addCanonicalUrls (files, metalsmith, done) {
    Object.keys(files).filter(filter).forEach((file) => {
      debug('Adding canonical URL to %s', file)
      var meta = files[file]
      meta.canonical = site.url + meta.path
      debug('Addded URL: %s', meta.canonical)
    })
    done()
  }
}

module.exports = addCanonicalUrlsPlugin
// require this plugin in ./tasks/metalsmith using:
// const addCanonicalUrls = require(paths.lib('metalsmith/plugins/add-canonical-urls.js'))
