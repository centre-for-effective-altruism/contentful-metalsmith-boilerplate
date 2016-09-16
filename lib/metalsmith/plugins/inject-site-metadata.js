// Inject Site Metadata - Injects The Site Metadata Into The Metalsmith Global Meta
const site = require('../../helpers/site-information')

function injectSiteMetadataPlugin () {
  // main plugin returned to Metalsmith
  return function injectSiteMetadata (files, metalsmith, done) {
    metalsmith.metadata().site = site
    done()
  }
}

module.exports = injectSiteMetadataPlugin
// require this plugin in ./tasks/metalsmith using:
// const injectSiteMetadata = require(paths.lib('metalsmith/plugins/inject-site-metadata.js'))
