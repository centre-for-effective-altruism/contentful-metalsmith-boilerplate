// Inject Contentful Files - Injects Contentful Files Into The Build
const debug = require('debug')('inject-contentful-files')  // DEBUG=inject-contentful-files

function injectContentfulFilesPlugin (contentfulFiles) {
  // main plugin returned to Metalsmith
  return function injectContentfulFiles (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(contentfulFiles).forEach((file) => {
      debug('Adding %s to the build', file)
      files[`${file}.contentful`] = contentfulFiles[file]
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = injectContentfulFilesPlugin
// require this plugin in ./tasks/metalsmith using:
// const injectContentfulFiles = require(paths.lib('metalsmith/plugins/inject-contentful-files.js'))
