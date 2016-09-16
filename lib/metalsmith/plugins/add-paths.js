const minimatch = require('minimatch')
const debug = require('debug')('add-paths')  // DEBUG=add-paths
const paths = require('../../helpers/file-paths') // helper to get build system paths
/**
 * Add Paths (Metalsmith plugin)
 *
 * Add a path key to files based on their file path. Paths are relativised to
 * the site root, and will be used to create canonical URLs. This means you
 * should take into account the way your server handles trailing slashes
 * to avoid confusing search engines.
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 * @param {boolean}         opts.trailingSlash - append a trailing slash to the canonical URL?
 *
 */
function addPathsPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html',
    trailingSlash: true
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  return function addPaths (files, metalsmith, done) {
    Object.keys(files).filter(filter).forEach((file) => {
      debug('Checking %s', file)
      const meta = files[file]
      // special handling if the file is the root index file
      if (file === 'index.html') meta.path = '/'
      // make paths relative to the site root
      else meta.path = `/${file.replace('/index.html', '')}${options.trailingSlash && minimatch(file, '*/**') ? '/' : ''}`

      debug('Set path to %s', meta.path)
    })
    done()
  }
}

module.exports = addPathsPlugin
// require this plugin in ./tasks/metalsmith using:
// const addPaths = require(paths.lib('metalsmith/plugins/add-paths.js'))
