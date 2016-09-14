const Promise = require('bluebird')

const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const paths = require('../../lib/helpers/file-paths')

const console = require('better-console')

const chalk = require('chalk')
const banner = require(paths.helpers('console-banner'))
const contentfulFieldWarnings = require(paths.helpers('contentful-field-warnings'))

const generate = require('./create-content-type').generate

var contentTypes = [
  {
    name: 'Page',
    id: 'page',
    plural: 'Pages',
    description: 'A basic web page',
    shortTitleField: true,
    fields: 'page-schema-fields.json',
    contentfulFieldWarnings: [
      contentfulFieldWarnings.appearance('Layout', 'Radio')
    ]
  },
  {
    name: 'Post',
    id: 'post',
    plural: 'Posts',
    description: 'A blog post',
    pagination: true,
    paginationPerPage: 10,
    collectionSortField: 'date',
    collectionSortReverse: true
  },
  {
    name: 'Link',
    id: 'link',
    plural: 'Links',
    description: 'A link to content on the internet, or an internal link to a page on this site (e.g. an automatically-generated page, like a collection)',
    shortTitleField: true,
    slugField: false,
    bodyField: false,
    fields: 'link-schema-fields.json',
    contentfulFieldWarnings: [
      contentfulFieldWarnings.appearance('Link URL/URI', 'URL')
    ],
    createPage: false
  },
  {
    name: 'Series',
    id: 'series',
    plural: 'Series',
    description: 'A collection of content in a particular order (e.g. a navigation menu, or a series of blog posts)',
    bodyField: false,
    fields: 'series-schema-fields.json',
    createPage: false
  }
]

function run () {
  banner('Creating default content types')
  console.log(chalk.white.dim(`(${contentTypes.map((c) => c.name).join(', ')})`))

  return Promise.all(contentTypes.map((contentType) => {
    // prepare content types, including reading in JSON schema for additional fields
    if (contentType.fields) {
      return fs.readFileAsync(path.join(__dirname, 'content-type-schemas', contentType.fields))
        .then((schemaFieldsFile) => {
          var fields = { fields: JSON.parse(schemaFieldsFile) }
          return Object.assign({}, contentType, fields)
        })
    }
    return new Promise((resolve) => resolve(contentType))
  }))
    .then(function (contentTypes) {
      return generate(contentTypes)
    })
}

// export the run() function so we can call it programmatically
if (!(require.main === module)) {
  module.exports = {run}
// otherwise run as a CLI
} else {
  run()
}
