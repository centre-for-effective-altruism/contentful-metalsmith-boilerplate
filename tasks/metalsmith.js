/**********************

  Main build script

**********************/

// load environment variables
require('dotenv').load({silent: true})
var console = require('better-console')
// get path helpers
const paths = require('../lib/helpers/file-paths')
require(paths.helpers('console-banner'))({ title: 'Building the site using Metalsmith!', color: 'cyan' })
// start a logger with a timer
const LogMessage = require(paths.helpers('log-message'))
const message = new LogMessage()
const _message = message.plugin // metalsmith wrapper for message

console.info(`NODE_ENV: ${process.env.NODE_ENV}`)
console.info(`NODE VERSION: ${process.version}`)
console.info(`BUILD TIMESTAMP: ${message.timestamp}`)

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
const MarkdownIt = require('metalsmith-markdownit')
const markdown = MarkdownIt()
const MarkdownItAttrs = require('markdown-it-attrs')
markdown.use(MarkdownItAttrs)
const htmlPostprocessing = require(paths.lib('metalsmith/plugins/html-postprocessing'))
const sanitizeShortcodes = require(paths.lib('metalsmith/plugins/sanitize-shortcodes.js'))
const saveRawContents = require(paths.lib('metalsmith/plugins/save-raw-contents'))
message.status('Loaded Markdown/HTML parsing plugins')
// layouts
const layouts = require('metalsmith-layouts')
const remapLayoutNames = require(paths.lib('metalsmith/plugins/remap-layout-names'))
const shortcodes = require('metalsmith-shortcodes')
const shortcodes = require('metalsmith-shortcodes')
const lazysizes = require('metalsmith-lazysizes')
const icons = require('metalsmith-icons')
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
const addPaths = require(paths.lib('metalsmith/plugins/add-paths.js'))
const createContentfulFileIdMap = require(paths.lib('metalsmith/plugins/create-contentful-file-id-map.js'))
const createSeriesHierarchy = require(paths.lib('metalsmith/plugins/create-series-hierarchy.js'))
message.status('Loaded metadata plugins')

// only require in production
if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
  const htmlMinifier = require('metalsmith-html-minifier')
  const purifyCSS = require(paths.lib('metalsmith/plugins/purifycss.js'))
  const cleanCSS = require('metalsmith-clean-css')
  const sitemap = require('metalsmith-sitemap')
  message.status('Loaded production modules')
}
// utility
const NotificationCenter = require('node-notifier').NotificationCenter
const notifier = new NotificationCenter()
// utility global const to hold 'site' info from our settings file, for reuse in other plugins
const site = require(paths.helpers('site-information'))

message.status('Loaded utilities...')
message.success('All dependencies loaded!')

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
      .use(injectSiteMetadata)
      .use(injectContentfulFiles(contentTypes.contentful))
      .use(_message.info('Prepared global metadata'))
      .use(contentful({
        'accessToken': process.env.CONTENTFUL_ACCESS_TOKEN
      }))
      .use(function (files, metalsmith, done) {
        // get rid of the contentful source files from the build
        Object.keys(files).filter(minimatch.filter('**/*.contentful')).forEach(function (file) {
          delete files[file]
        })
        done()
      })
      .use(_message.info('Downloaded content from Contentful'))
      .use(processContentfulMetadata)
      .use(remapLayoutNames)
      .use(_message.info('Processed Contentful metadata'))
      .use(collections(contentTypes.collections))
      .use(pagination(contentTypes.pagination))
      .use(_message.info('Added files to collections'))
      .use(checkSlugs)
      .use(create404)
      .use(rebase([
        {
          pattern: 'pages/**/*.index.html',
          rebase: ['pages', '']
        },
        {
          pattern: 'home/index.html',
          rebase: ['home', '']
        },
        {
          pattern: 'images/favicons/**',  // move favicons to root directory
          rebase: (file) => file.split('/').pop()
        }
      ]))
      .use(_message.info('Moved files into place'))
      .use(addPaths)
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
      .use(createContentfulFileIdMap)
      .use(createSeriesHierarchy)
      .use(_message.info('Built series hierarchy'))
      // Build HTML files
      .use(markdown({
        plugin: {
          pattern: '**/*.html'
        }
      }))
      .use(_message.info('Converted Markdown to HTML'))
      .use(htmlPostprocessing)
      .use(_message.info('Post-processed HTML'))
      .use(excerpts())
      .use(shortcodes(shortcodeOpts))
      .use(_message.info('Converted Shortcodes'))
      .use(saveRawContents)
      .use(layouts(Object.assign({
        engine: 'pug',
        directory: paths.layouts(),
        pretty: process.env.NODE_ENV === 'development',
        cache: true
      }, layoutUtils)))
      .use(_message.info('Built HTML files from templates'))
      .use(icons({
        fontDir: 'fonts',
        customIcons: 'fonts/glyphs.json'
      }))
      .use(_message.info('Added icon fonts'))
      .use(lazysizes({
        widths: [100, 480, 768, 992, 1200, 1800],
        qualities: [ 50, 70, 70, 70, 70, 70],
        backgrounds: ['#content-wrapper', '.featured-image', '.card-thumbnail'],
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
        .use(_message.info('Minifying HTML', chalk.dim))
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
        .use(purifyCSS)
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
      const t = formatBuildTime(buildTime)
      if (err) {
        message('Build failed!', chalk.red.bold)
        console.trace(err)
        if (process.env.NODE_ENV === 'development') {
          notifier.notify({
            title: 'Build failed!',
            message: err,
            appIcon: '',
            contentImage: path.join(__dirname, '..', 'src', 'metalsmith', 'images', 'favicons', 'favicon-96x96.png'), // absolute path (not balloons) 
            sound: 'Funk',
            activate: 'com.apple.Terminal'
          })
        }
      }
      if (files) {
        if (process.env.NODE_ENV === 'development') {
          notifier.notify({
            title: 'Build succeeded!',
            message: 'Click to switch to Chrome',
            appIcon: '',
            contentImage: path.join(__dirname, '..', 'src', 'metalsmith', 'images', 'favicons', 'favicon-96x96.png'), // absolute path (not balloons) 
            sound: 'Glass',
            activate: 'com.google.Chrome'
          })
        }
        message('✓ Build OK!', chalk.green.bold)
      }
      if (process.env.NODE_ENV === 'development' && typeof done === 'function') {
        done()
      }
    })
  }
}
