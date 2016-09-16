const minimatch = require('minimatch')
const debug = require('debug')('check-slugs')  // DEBUG=check-slugs
const paths = require('../../helpers/file-paths') // helper to get build system paths
const slug = require(paths.helpers('slug'))

/**
 * Check Slugs (Metalsmith plugin)
 *
 * Checks that all HTML files have a `slug` field
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter(), which receives Metalsmith filenames
 * @param {Array}           opts.fields - array of Metalsmith fields that can be used to create slugs if no `slug` field is present, in order of preference
 *
 */
function checkSlugsPlugin (opts) {
  const defaults = {
    filter: '**/*.html',
    fields: ['title']
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  return function checkSlugs (files, metalsmith, done) {
    Object.keys(files).filter(filter).forEach((file) => {
      const meta = files[file]
      // add a slug if we don't have one
      if (!meta.slug) {
        for (var i = 0, l = options.fields.length; i < l; ++i) {
          if (typeof options.fields[i] === 'string') {
            meta.slug = slug(options.fields[i])
            break
          }
        }
      }
      // double check that by this point we actually have a slug
      if (!meta.slug) {
        throw new Error(`Could not set slug for file ${file}`)
      }
    })
    done()
  }
}

module.exports = checkSlugsPlugin
// require this plugin in ./tasks/metalsmith using:
// const checkSlugs = require(paths.lib('metalsmith/plugins/check-slugs.js'))

