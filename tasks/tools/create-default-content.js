// Create the default content for the space

const Contentful = require('contentful-content-management')
const Promise = require('bluebird')
const paths = require('../../lib/helpers/file-paths')
const banner = require(paths.helpers('console-banner'))
const tick = require(paths.helpers('tick'))
const console = require('better-console')

var schema = require('./content-schemas')

const contentful = new Contentful()

banner('Creating default Contentful content')

function run () {

  let entriesForNavSeries = []
  return contentful.space((space) => {
    // create pages
    return Promise.all([
      Promise.map(contentful.formatItems(schema.pages), (page) => {
        return space.createEntry('page', page)
          .then((page) => page.publish())
          .then((page) => { entriesForNavSeries.push(page) })
      })
        .then(() => {
          console.log(tick, 'Created Pages')
        }),
      Promise.map(contentful.formatItems(schema.posts), (post) => {
        return space.createEntry('post', post)
          .then((post) => post.publish())
      })
        .then(() => {
          console.log(tick, 'Created Posts')
        }),
      Promise.map(contentful.formatItems(schema.links), (link) => {
        return space.createEntry('link', link)
          .then((link) => link.publish())
          .then((link) => { entriesForNavSeries.push(link) })
      })
        .then(() => {
          console.log(tick, 'Created Links')
        })
    ])
    .then(() => { console.info('Waiting while assets publish...') })
    .delay(5000) // wait for everything to be published successfully, otherwise the series won't resolve links properly...
    .then(() => {
      const seriesItems = []
      entriesForNavSeries.forEach((entry) => {
        seriesItems.push({
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: entry.sys.id
          }
        })
      })
      schema.series[0].items = seriesItems
      return space.queue('createEntry', 'series', contentful.formatItems(schema.series))
        .then((series) => contentful.itemQueue('publish', series))
        .then((series) => {
          console.log(tick, 'Created Series')
        })
    })
    .catch((e) => { throw e })
  })
  .catch((e) => { console.error(e.name, e.message); console.trace(e) })
}

// export the run() function so we can call it programmatically
if (!(require.main === module)) {
  module.exports = {run}
// otherwise run as a CLI
} else {
  run()
}