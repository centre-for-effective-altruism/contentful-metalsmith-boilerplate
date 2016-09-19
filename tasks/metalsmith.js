/**********************

  Main build script

**********************/

// load environment variables
require('dotenv').load({silent: true})
var console = require('better-console')
// get path helpers
const paths = require('../lib/helpers/file-paths')
const site = require(paths.helpers('site-information'))
require(paths.helpers('console-banner'))({ title: `Building ${site.title}!`, color: 'cyan' })
// start a logger with a timer
const LogMessage = require(paths.helpers('log-message'))
const message = new LogMessage()
const _message = message.plugin // metalsmith wrapper for message

console.info(`NODE_ENV: ${process.env.NODE_ENV}`)
console.info(`NODE VERSION: ${process.version}`)
console.info(`BUILD TIMESTAMP: ${message.timestamp()}`)

// default process.env.NODE_ENV to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
// cache require paths in development
if (process.env.NODE_ENV === 'development') {
  require('cache-require-paths')
}

// Start requiring dependencies
message.info('Loading dependencies...')
// Metalsmith
const Metalsmith = require('metalsmith')
message.status('Loaded Metalsmith')
// utilities
const contentful = require('contentful-metalsmith')
const injectContentfulFiles = require(paths.lib('metalsmith/plugins/inject-contentful-files'))
const ignore = require('metalsmith-ignore')
const concat = require('metalsmith-concat')
const branch = require('metalsmith-branch')
message.status('Loaded utility plugins')
// Markdown processing
const markdown = require('metalsmith-markdownit')
const MarkdownItAttrs = require('markdown-it-attrs')
const htmlPostprocessing = require(paths.lib('metalsmith/plugins/html-postprocessing'))
const sanitizeShortcodes = require(paths.lib('metalsmith/plugins/sanitize-shortcodes.js'))
const saveRawContents = require(paths.lib('metalsmith/plugins/save-raw-contents'))
message.status('Loaded Markdown/HTML parsing plugins')
// layouts
const layouts = require('metalsmith-layouts')
const remapLayoutNames = require(paths.lib('metalsmith/plugins/remap-layout-names'))
const shortcodes = require('metalsmith-shortcodes')
const lazysizes = require('metalsmith-lazysizes')
const icons = require('metalsmith-icons')
const favicons = require(paths.lib('metalsmith/plugins/favicons'))
message.status('Loaded layout plugins')
// methods to inject into layouts / shortcodes
const layoutUtils = {
  typogr: require('typogr'),
  truncate: require('truncate'),
  url: require('url'),
  moment: require('moment'),
  slugify: require('slug'),
  strip: require(paths.helpers('strip-tags')),
  contentfulImage: require(paths.helpers('contentful-image')),
  environment: process.env.NODE_ENV
}

const shortcodeOpts = Object.assign({
  directory: paths.templates('shortcodes'),
  pattern: '**/*.html',
  engine: 'pug',
  extension: '.pug'
}, layoutUtils)
message.status('Loaded templating utilities')
// metadata and structure
const injectSiteMetadata = require(paths.lib('metalsmith/plugins/inject-site-metadata'))
const processContentfulMetadata = require(paths.lib('metalsmith/plugins/process-contentful-metadata'))
const contentTypes = require('../lib/metalsmith/helpers/content-types')
const collections = require('metalsmith-collections')
const checkSlugs = require(paths.lib('metalsmith/plugins/check-slugs.js'))
const excerpts = require('metalsmith-excerpts')
const pagination = require('metalsmith-pagination')
const navigation = require('metalsmith-navigation')
const create404 = require(paths.lib('metalsmith/plugins/create-404.js'))
const rebase = require(paths.lib('metalsmith/plugins/rebase'))
const deleteFiles = require(paths.lib('metalsmith/plugins/delete-files.js'))
const addPaths = require(paths.lib('metalsmith/plugins/add-paths.js'))
const createContentfulFileIdMap = require(paths.lib('metalsmith/plugins/create-contentful-file-id-map.js'))
const createSeriesHierarchy = require(paths.lib('metalsmith/plugins/create-series-hierarchy.js'))
const addCanonicalUrls = require(paths.lib('metalsmith/plugins/add-canonical-urls'))
message.status('Loaded metadata plugins')

// only require these modules in production
let htmlMinifier
let purifyCSS
let cleanCSS
let sitemap
if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
  htmlMinifier = require('metalsmith-html-minifier')
  purifyCSS = require(paths.lib('metalsmith/plugins/purifycss.js'))
  cleanCSS = require('metalsmith-clean-css')
  sitemap = require('metalsmith-sitemap')
  message.status('Loaded production modules')
}
// utility global const to hold 'site' info from our settings file, for reuse in other plugins

message.status('Loaded utilities...')
message.success('All dependencies loaded!')
build()()

// call the master build function
function build (buildCount) {
  buildCount = buildCount || 1
  if (buildCount > 1) message.start() // reset the timer
  return function (done) {
    // START THE BUILD!
    const metalsmith = new Metalsmith(__dirname)
    metalsmith
      .source('../src/metalsmith')
      .destination('../build')
      .use(ignore([
        '**/.DS_Store'
      ]))
      .use(injectSiteMetadata())
      .use(injectContentfulFiles(contentTypes.contentful))
      .use(_message.info('Prepared global metadata'))
      .use(contentful({
        access_token: process.env.CONTENTFUL_DELIVERY_ACCESS_TOKEN,
        space_id: process.env.CONTENTFUL_SPACE
      }))
      .use(deleteFiles({
        filter: '**/*.contentful'
      }))
      .use(_message.info('Downloaded content from Contentful'))
      .use(processContentfulMetadata())
      .use(remapLayoutNames())
      .use(_message.info('Processed Contentful metadata'))
      .use(collections(contentTypes.collections))
      .use(pagination(contentTypes.pagination))
      .use(_message.info('Added files to collections'))
      .use(checkSlugs())
      .use(create404())
      .use(rebase([
        {
          pattern: 'pages/**/index.html',
          rebase: ['pages', '']
        },
        {
          pattern: 'home/index.html',
          rebase: ['home', '']
        },
        {
          pattern: 'posts/**/index.html',
          rebase: ['posts', 'blog']
        }
      ]))
      .use(_message.info('Moved files into place'))
      .use(addPaths())
      .use(addCanonicalUrls())
      .use(branch()
        .pattern('**/*.html')
        .use(navigation({
          main: {
            includeDirs: true
          }
        }, {
          permalinks: true
        }))
      )
      .use(_message.info('Added navigation metadata'))
      .use(createContentfulFileIdMap())
      .use(createSeriesHierarchy())
      .use(_message.info('Built series hierarchy'))
      // Build HTML files
      .use(markdown({
        plugin: {
          pattern: '**/*.html'
        }
      }).use(MarkdownItAttrs))
      .use(_message.info('Converted Markdown to HTML'))
      .use(htmlPostprocessing())
      .use(sanitizeShortcodes())
      .use(_message.info('Post-processed HTML'))
      .use(excerpts())
      .use(shortcodes(shortcodeOpts))
      .use(_message.info('Converted Shortcodes'))
      .use(deleteFiles({
        filter: '@(series|links)/**' 
      }))
      .use(saveRawContents())
      .use(layouts(Object.assign({
        engine: 'pug',
        directory: paths.layouts(),
        pretty: process.env.NODE_ENV === 'development',
        cache: true
      }, layoutUtils)))
      .use(_message.info('Built HTML files from templates'))
      .use(icons({
        fontDir: 'fonts',
      }))
      .use(_message.info('Added icon fonts'))
      .use(lazysizes({
        widths: [100, 480, 768, 992, 1200, 1800],
        qualities: [ 50, 70, 70, 70, 70, 70],
        backgrounds: ['.card-thumbnail'],
        ignore: '/images/**',
        ignoreSelectors: '.content-block-content',
        querystring: {
          w: '%%width%%',
          q: '%%quality%%'
        }
      }))
      .use(_message.info('Added responsive image markup'))

    // stuff to only do in production
    if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
      metalsmith
        .use(_message.info('Minifying HTML'))
        .use(htmlMinifier('**/*.html', {
          minifyJS: true
        }))
        .use(_message.info('Minified HTML'))
        .use(concat({
          files: ['styles/app.min.css', 'styles/icons.css'],
          output: 'styles/app.min.css',
          keepConcatenated: false,
          forceOutput: true
        }))
        .use(_message.info('Concatenated CSS files'))
        .use(purifyCSS())
        .use(_message.info('Cleaned CSS files'))
        .use(cleanCSS({
          cleanCSS: {
            rebase: false
          }
        }))
        // delete sourcemaps and settings
        .use(deleteFiles({
          filter: '{**/*.map,settings/**}'
        }))
        .use(sitemap({
          hostname: site.url,
          omitIndex: true,
          modified: 'data.sys.updatedAt'
        }))
        .use(_message.info('Built sitemap'))
    }

    // Run build
    metalsmith.use(_message.info('Finalising build')).build(function (err, files) {
      if (err) {
        message.error('Build failed!')
        console.trace(err)
      }
      if (files) {
        message.success('Build done!')
      }
      if (process.env.NODE_ENV === 'development' && typeof done === 'function') {
        done()
      }
    })
  }
}
