// Create the default content for the space
const Contentful = require('contentful-content-management')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const paths = require('../../lib/helpers/file-paths')

const inquirer = require('inquirer')

const chalk = require('chalk')
const banner = require(paths.helpers('console-banner'))
const tick = require(paths.helpers('tick'))
const console = require('better-console')

const pluralize = require('pluralize')
const slug = require(paths.helpers('slug'))
const trim = require('trim')
const stringify = require('stringify-object')

const contentful = new Contentful()

banner('Importing Content Types from Contentful')

function run () {
  const questions = [
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow(`This will overwrite your existing Content Type definitions with ones imported from Contentful. Are you sure you want to do this?`),
      default: false
    }
  ]

  return inquirer.prompt(questions)
    .then(answers => {
      if (answers.confirm !== true) {
        return
      }
      return contentful.space(space => {
        space.getContentTypes()
          .then(contentTypes => {
            return Promise.all([
              Promise.map(contentTypes.items, contentType => {
                const contentTypeSchema = {
                  name: {
                    singular: contentType.name,
                    plural: pluralize(contentType.name)
                  },
                  slug: {
                    singular: slug(trim(contentType.name)),
                    plural: slug(trim(pluralize(contentType.name)))
                  },
                  contentfulId: contentType.sys.id, // used by the API
                  contentfulFilenameField: contentType.fields.slug ? 'sys.id' : 'fields.slug', // used by metalsmith-contentful to build filenames
                  collection: {
                    sort: 'title',
                    reverse: false
                  },
                  createPage: true
                }
                const contentTypeSchemaFile = `// Schema for ${contentTypeSchema.slug.plural}\nmodule.exports = ${stringify(contentTypeSchema, {indent: '  '})}\n`
                const contentTypeSchemaFilePath = paths.tasks(`metalsmith/content-types/${contentTypeSchema.contentfulId}.js`)
                return fs.writeFileAsync(contentTypeSchemaFilePath, contentTypeSchemaFile)
                  .then(() => {
                    console.info(tick, `Created schema for ${chalk.cyan(contentTypeSchema.name.plural)}`)
                  })
              }),
              Promise.resolve()
                .then(() => {
                  const indexFile = ['module.exports = {']
                  indexFile.push(contentTypes.items.map(contentType => `  ${contentType.sys.id}: require('./${contentType.sys.id}.js')`).join(',\n'))
                  indexFile.push('}','')
                  return fs.writeFileAsync(paths.tasks(`metalsmith/content-types/index.js`), indexFile.join('\n'))
                    .then(() => {
                      console.info(tick, `Created schema index`)
                    })
                })
            ])
          })
      })
    })
}

// export the run() function so we can call it programmatically
if (!(require.main === module)) {
  module.exports = {run}
// otherwise run as a CLI
} else {
  run()
}
