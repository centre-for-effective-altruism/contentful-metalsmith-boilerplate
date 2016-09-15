const minimatch = require('minimatch')
const debug = require('debug')('create-contentful-file-id-map')  // DEBUG=create-contentful-file-id-map
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * Create Contentful File ID Map (Metalsmith plugin)
 *
 * Maps Contentful file IDs to corresponding files in the Metalsmith build. This
 * is useful if you need to use a Contentful Link, but want to refer to the
 * file in the build chain (which will be processed by Metalsmith), rather than
 * the raw Contentful object
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 * @param {string}          opts.mapName - the name of the map that will hold the IDs. Will be available at metalsmith.metadata()[<mapName>] in Metalsmith, or as <mapName> in layout files
 * @param {string}          opts.contentfulIDField - the name of the Metalsmith field that holds the file's Contentful ID
 *
 */
function createContentfulFileIdMapPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html',
    mapName: 'contentfulIDMap',
    contentfulIDField: 'id'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function createContentfulFileIdMap (files, metalsmith, done) {
    const metadata = metalsmith.metadata()
    metadata[options.mapName] = {}
    Object.keys(files).filter(filter).forEach((file) => {
      if (files[file][options.contentfulIDField]) {
        metadata[options.mapName][files[file][options.contentfulIDField]] = files[file]
      }
    })
    done()
  }
}

module.exports = createContentfulFileIdMapPlugin
// require this plugin in ./tasks/metalsmith using:
// const createContentfulFileIdMap = require(paths.lib('metalsmith/plugins/create-contentful-file-id-map.js'))
