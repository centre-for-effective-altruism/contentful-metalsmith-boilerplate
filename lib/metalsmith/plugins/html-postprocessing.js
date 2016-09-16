// HTML Postprocessing - Postprocesses HTML Returned From A Markdown Parser
const minimatch = require('minimatch')
const debug = require('debug')('html-postprocessing')  // DEBUG=html-postprocessing

const cheerio = require('cheerio')
const url = require('url')
const typogr = require('typogr')

function htmlPostprocessingPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html',
    paragraphs: true,
    imageFigures: true,
    imageResponsive: true,
    imageProtocol: 'https',
    tableClasses: true,
    footnotesHeading: true,
    typogr: true
  }
  const options = Object.assign(defaults, opts)
  // filter param can either be a glob string (passed to minimatch.filter) or a function suitable for Array.filter()
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function htmlPostprocessing (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(files).filter(filter).forEach((file) => {
      // Load HTML into Cheerio
      let html = files[file].contents.toString()
      const $ = cheerio.load(html)

      // styling for first/last paragraphs
      if (options.paragraphs) {
        debug('Adding .first- and .last-paragraph classes to %s', file)
        $('p').first().addClass('first-paragraph')
        $('p').last().addClass('last-paragraph')
      }

      // image transforms
      $('img').each(function () {
        const img = $(this)
        // ensure Contentful (or other protocol-relative) URLs use HTTPS protocol
        if (options.imageProtocol) {
          const imgUrl = url.parse(img.attr('src'))
          imgUrl.protocol = ['http', 'https'].indexOf(options.imageProtocol) > -1 ? options.imageProtocol : 'https'
          img.attr('src', url.format(imgUrl))
        }
        // wrap images that are in p tags in figures instead
        if (options.figures) {
          const parent = img.parent()
          if (parent[0] && parent[0].name === 'p') {
            parent.replaceWith(function () {
              let figcaption = $('<figcaption />')
                .append($(this).contents().clone())
              figcaption.find('img').remove()
              if (figcaption.text().length <= 0) {
                figcaption = ''
              }
              return $('<figure />')
                .append(img)
                .append(figcaption)
            })
          }
        }
        // add img-responsive tags to images
        if (options.imageResponsive) {
          img.addClass('img-responsive')
        }
      })

      // add a heading to our footnotes
      if (options.footnotesHeading) {
        $('section.footnotes').prepend('<h2 class="footnotes-title">Footnotes</h2>')
      }

      if (options.tableClasses) {
        $('table').each(function () {
          const table = $(this)
          // add bootstrap styles to tables
          table.addClass('table table-striped')
        })
      }

      // save Cheerio AST back to a HTML string
      html = $.html()

      // Run typogr on the HTML
      if (options.typogr) {
        debug('Typogrifying HTML in %s', file)
        html = typogr.typogrify(html)
      }
    })

    // tell Metalsmith that we're done
    done()
  }
}

module.exports = htmlPostprocessingPlugin
// require this plugin in ./tasks/metalsmith using:
// const htmlPostprocessing = require(paths.lib('metalsmith/plugins/html-postprocessing.js'))
