const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const paths = require('../../lib/helpers/file-paths')

const console = require('better-console')
const tick = require(paths.helpers('tick'))
const chalk = require('chalk')

const inquirer = require('inquirer')
const validation = require(paths.helpers('inquirer-validation'))
const validate = validation.validate
const required = validation.required

const capitalize = require('capitalize')
const camelCase = require('camelcase')
const slug = require(paths.helpers('slug'))


function run () {
  const questions = [
    {
      name: 'name',
      message: 'Plugin Name (e.g. Parse HTML, Process Navigation): ',
      validate: validate(required, noConflict),
      filter: capitalize.words
    },
    {
      name: 'description',
      message: 'Briefly describe what this plugin will do: ',
      validate: validate(required)
    }
  ]

  return inquirer.prompt(questions)
    .then((answers) => {
      const plugin = {
        name: answers.name,
        description: capitalize(answers.description),
        fileName: `${slug(answers.name)}`,
        functionName: camelCase(answers.name)
      }

      const pluginFile = pluginFileFactory(plugin)
      const filePath = paths.lib(`metalsmith/plugins/${plugin.fileName}.js`)

      return fs.writeFileAsync(filePath, pluginFile)
        .then(() => {
          console.log(`\n`)
          console.info(tick, `Created plugin ${plugin.name} boilerplate at ${chalk.cyan(`./${path.relative(paths.root(), filePath)}`)}\n`)
          console.log(`${chalk.magenta(`You should add the following line to`)} ${chalk.cyan(`./tasks/metalsmith.js`)}: \n`)
          console.log(`${chalk.cyan(`const`)} ${plugin.functionName} = ${chalk.cyan(`require`)}(paths.lib(${chalk.yellow(`'metalsmith/plugins/${plugin.fileName}'`)}))\n`)
        })
    })
    .catch((e) => {
      console.error(e.name, e.message)
      console.trace(e)
    })
}

function pluginFileFactory (plugin) {
  return `const minimatch = require('minimatch')
const debug = require('debug')('${plugin.fileName}')  // DEBUG=${plugin.fileName}
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * ${plugin.name} (Metalsmith plugin)
 *
 * ${plugin.description}
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 *
 */
function ${plugin.functionName}Plugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function ${plugin.functionName} (files, metalsmith, done) {
    // plugin code goes here
    Object.keys(files).filter(filter).forEach((file) => {
      // loop through a filtered subset of files...
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = ${plugin.functionName}Plugin
// require this plugin in ./tasks/metalsmith using:
// const ${plugin.functionName} = require(paths.lib('metalsmith/plugins/${plugin.fileName}.js'))
`
}

function noConflict (name) {
  const filePath = paths.lib(`metalsmith/plugins/${slug(name)}.js`)
  return new Promise((resolve, reject) => {
    return fs.statAsync(filePath)
    .then((stat) => { reject(Error(`Error, there is already a plugin with the name ${chalk.cyan(name)} ${chalk.dim(`(./${path.relative(paths.root(), filePath)})`)}`)) })
    .catch((e) => { resolve(true) })
  })
}

// export the run() function so we can call it programmatically
if (!(require.main === module)) {
  module.exports = {run}
// otherwise run as a CLI
} else {
  run()
}
