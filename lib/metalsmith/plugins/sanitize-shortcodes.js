// Sanitize Shortcodes - Sanitizes Shortcodes That Have Been Mangled By Typogr Etc
const minimatch = require('minimatch')
const debug = require('debug')('sanitize-shortcodes')  // DEBUG=sanitize-shortcodes

function sanitizeShortcodesPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html'
  }
  const options = Object.assign(defaults, opts)
  // filter param can either be a glob string (passed to minimatch.filter) or a function suitable for Array.filter()
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function sanitizeShortcodes (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(files).filter(filter).forEach((file) => {
      debug('Checking file %s', file)
      let html = files[file].contents.toString()
      html = html.replace(/(<p.*?>.*?|.*?)(\[)(.*?)(\])(.*?<\/p>|.*?)/gim, function (match, openingTag, openingShortcode, shortCodeParams, closingShortcode, closingTag) {
        debug('Found match', match)
        debug('Shortcode params are %s', shortCodeParams)
        if (/^\d+$/.test(shortCodeParams)) {
          debug('This is a footnote reference, no change needed: %s')
          return match
        }
        shortCodeParams = shortCodeParams.replace(/<.*?>.*?<\/.*>/g, ' ').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/(&nbsp;|&#xA0;)/g, ' ')
        var useOuterTags = openingTag.search(/<p.*>$/) === -1
        var output = (useOuterTags ? openingTag : '') + openingShortcode + shortCodeParams + closingShortcode + (useOuterTags ? closingTag : '')
        debug('Returning output %s', output)
        return output
      })
      files[file].contents = html
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = sanitizeShortcodesPlugin
// require this plugin in ./tasks/metalsmith using:
// const sanitizeShortcodes = require(paths.lib('metalsmith/plugins/sanitize-shortcodes.js'))
