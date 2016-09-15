// Process Contentful Metadata - Move The Contentful 'fields' Metadata To The File's Global Meta
const minimatch = require('minimatch')
const debug = require('debug')('process-contentful-metadata')  // DEBUG=process-contentful-metadata

function processContentfulMetadataPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html'
  }
  const options = Object.assign(defaults, opts)
  // filter param can either be a glob string (passed to minimatch.filter) or a function suitable for Array.filter()
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function processContentfulMetadata (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(files).filter(filter).forEach((file) => {
      const meta = files[file]
      // make sure we have contentful data
      if (!meta.data || !meta.data.fields) {
        return
      }

      // add all the 'data' fields to the global meta
      Object.keys(meta.data.fields).forEach(function (key) {
        // 'body' is used as the main content fields in our Contentful install, so add them to the 'contents' key
        if (['body'].indexOf(key) > -1) {
          meta.contents = meta.data.fields[key] || ''
        } else {
          meta[key] = meta.data.fields[key]
        }
      })

      // add date information to the post - preference a field called 'date', otherwise use the system timestamp
      meta.date = meta.date || meta.data.sys.createdAt
      meta.updated = meta.updated || meta.data.sys.updatedAt

      // metalsmith gets a bit antsy if files don't have a string at the `contents` key
      meta.contents = meta.contents && meta.contents.length > 0 ? meta.contents : ''
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = processContentfulMetadataPlugin
// require this plugin in ./tasks/metalsmith using:
// const processContentfulMetadata = require(paths.lib('metalsmith/plugins/process-contentful-metadata.js'))
