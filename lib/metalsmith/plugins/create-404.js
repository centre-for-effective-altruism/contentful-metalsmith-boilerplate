const minimatch = require('minimatch')
const debug = require('debug')('create-404')  // DEBUG=create-404
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * Create 404 (Metalsmith plugin)
 *
 * Create a 404 page from a file in Metalsmith, or a default one if nothing exists
 *
 * @param {Object} opts - plugin options
 * @param {string} opts.path - the path to the Metalsmith file you want to use as a 404 page
 * @param {string} title - the title to use for your 404 page
 * @param {string} contents - Body of the 404 page. If you're using a Markdown parser later in your build, use Markdown here!
 *
 */
function create404Plugin (opts) {
  const defaults = {
    path: 'pages/404/index.html',
    title: 'Page not found',
    contents: `Sorry, we couldn't find the page you requested.\n\nTry one of the links in the menu at the top of the page, or start at our [home page](/)`
  }
  const options = Object.assign(defaults, opts)
  // main plugin returned to Metalsmith
  return function create404 (files, metalsmith, done) {
    if (files[options.path]) {
      // if we have a 404 page at our path, put it in the right place
      debug('Found a 404 page at %s', options.path)
      files['404.html'] = files[options.path]
      delete files[options.path]
    } else {
      // otherwise build one from scratch
      files['404.html'] = {
        title: options.title,
        slug: '404',
        contents: options.contents,
        layout: 'page.pug',
      }
    }

    done()
  }
}

module.exports = create404Plugin
// require this plugin in ./tasks/metalsmith using:
// const create404 = require(paths.lib('metalsmith/plugins/create-404.js'))
