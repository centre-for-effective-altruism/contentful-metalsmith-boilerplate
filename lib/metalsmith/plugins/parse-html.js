// Parse HTML - Parses HTML From Markdown Using MarkdownIt
const minimatch = require('minimatch')
const debug = require('debug')('parse-html')
const MarkdownIt = require('markdown-it')
const MarkdownItAttrs = require('markdown-it-attrs')
const cheerio = require('cheerio')
const typogr = require('typogr')
const url = require('url')

function parseHtmlPlugin (opts) {
  const defaults = {
    file: false
  }
  const options = Object.assign(defaults, opts)
  return function parseHtml (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(files).filter(minimatch.filter('**/*.html')).forEach((file) => {
      // loop through a filtered subset of files...
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = parseHtmlPlugin
// require this plugin in ./tasks/metalsmith using:
// const parseHtml = require(paths.lib('metalsmith/plugins/parse-html.js'))
