const Contentful = require('contentful-content-management')
const Promise = require('bluebird')

const path = require('path')
const fs = Promise.promisifyAll(require('fs'))
const paths = require('../../lib/helpers/file-paths')

const inquirer = require('inquirer')

const console = require('better-console')
const chalk = require('chalk')
const tick = require(paths.helpers('tick'))
const submsgPrefix = '   > '
const banner = require(paths.helpers('console-banner'))

const generateSchemaIndex = require(paths.helpers('generate-schema-index'))

const minimatch = require('minimatch')

const contentful = new Contentful()
let contentTypes

function run () {
  banner(
    { title: 'Delete a Contentful Content Type',
      instructions: 'This utility allows you to delete Content Types from Contentful. Use with caution!',
      color: 'yellow'
    })

  return contentful.space((space) => {
    console.info('Getting existing Content Types')
    space.getContentTypes()
      .then((contentTypesCollection) => {
        contentTypes = contentTypesCollection.items
        if (!contentTypes || !contentTypes.length) {
          console.warn('There are no Content Types in the space!')
          return Promise.resolve()
        }
        // we've got content types, turn them into choices
        const choices = contentTypes.map((contentType) => ({
          name: contentType.name,
          value: contentType.sys.id
        }))
        // add an 'All types' catch-all if we have more than one choice
        if (choices.length > 1) {
          choices.push({
            name: chalk.red('All Content Types'),
            value: '*',
            short: chalk.red('All')
          })
        }
        // build questions for the prompt
        const questions = [
          {
            type: 'checkbox',
            name: 'contentTypes',
            message: `Choose Content Types to delete:`,
            choices: choices,
            filter: (answers) => (answers.filter((a) => a === '*').length ? contentTypes.map((c) => c.sys.id) : answers)
          },
          {
            type: 'confirm',
            name: 'confirmOnce',
            message: (answers) => chalk.yellow(`You have chosen to delete the following Content Types: ${answers.contentTypes.map((c) => chalk.cyan(getContentTypeName(c))).join(', ')}. Are you 100% sure you want to do this? ${chalk.red('This cannot be undone!')}`),
            default: false,
            when: (answers) => answers.contentTypes.length
          },
          {
            type: 'confirm',
            name: 'confirmTwice',
            message: chalk.yellow(`You're really, really sure?`),
            default: false,
            when: (answers) => answers.confirmOnce
          }
        ]
        // run the prompt
        return inquirer.prompt(questions)
          .then((answers) => {
            // if we don't have any content types to delete, get out of here
            if (!answers.contentTypes.length || !(answers.confirmOnce && answers.confirmTwice)) {
              console.info('No content types were deleted.')
              return true
            }
            console.info('Deleting Content Types...')
            // filter content types that we've marked for deletion, then delete them...
            return Promise.all(
              contentTypes.filter((contentType) => answers.contentTypes.indexOf(contentType.sys.id) > -1)
                .map((contentType) => Promise.resolve(contentType)
                  .then((contentType) => {
                    // check that the content type is not published
                    if (contentType.isPublished()) {
                      console.info(`Unpublishing ${contentType.name}`)
                      return contentType.unpublish()
                    }
                    // pass-through if it's already unpublished
                    return Promise.resolve(contentType)
                  })
                  .then((contentType) => {
                    // delete the content type
                    console.info(`Deleting ${contentType.name}`)
                    return contentType.delete()
                  })
                  .then(() => {
                    console.info(tick, `Successfully deleted Content Type ${chalk.cyan(contentType.name)} from Contentful`)
                  })
                  .catch((err) => {
                    let error
                    try {
                      error = JSON.parse(err.message)
                    } catch (e) {
                      error = err
                    }
                    console.warn(`Could not delete ${contentType.name}:`)
                    console.error(submsgPrefix, error.message)
                  })
              ))
              // delete build files associated with each content type
              .then(() => Promise.all(
                [
                  paths.tasks('metalsmith/content-types')
                ]
                  .map((dir) => fs.readdirAsync(dir)
                    .then((fileNames) => fileNames.filter(minimatch.filter(`@(${answers.contentTypes.join('|')}).js`)).map((fileName) => path.join(dir, fileName)))
                    .then((filePaths) => Promise.all(filePaths.map((filePath) => fs.unlinkAsync(filePath))))
                )
              )
                .then(() => {
                  // re-index the schema files
                  return generateSchemaIndex()
                })
                .then(() => {
                  console.log(tick, 'Removed build system files')
                }))
          })
          .catch((err) => {
            console.error(err)
            throw err
          })
      })
  })
  .catch((err) => {
    console.error(err)
    throw err
  })
  // Utility function to get a content type's name from its ID
  function getContentTypeName (contentTypeId) {
    if (!contentTypes) throw new Error('Cannot get Content Type name, there are no Content Types defined')
    return contentTypes
        .filter((contentType) => contentType.sys.id === contentTypeId)
        .map((contentType) => contentType.name)[0] || 'Unknown Content Type'
  }
}

// export the run() function so we can call it programmatically
if (!(require.main === module)) {
  module.exports = {run}
// otherwise run as a CLI
} else {
  run()
}
