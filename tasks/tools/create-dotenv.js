// Generate the .env file

const Promise = require('bluebird')
const paths = require('../../lib/helpers/file-paths')

const inquirer = require('inquirer')
const validation = require(paths.helpers('inquirer-validation'))
const validate = validation.validate
const required = validation.required

const chalk = require('chalk')
const fs = Promise.promisifyAll(require('fs'))

const tick = chalk.green('✓')
const banner = require(paths.helpers('console-banner'))

const dotenvKeys = {
  CONTENTFUL_SPACE: {
    message: 'Contentful Space ID',
    validate: validate(required, validateContentfulSpaceID)
  },
  CONTENTFUL_DELIVERY_ACCESS_TOKEN: {
    message: 'Contentful Delivery API Access Token',
    validate: validate(required, validateContentfulAPIKey)
  },
  CONTENTFUL_PREVIEW_ACCESS_TOKEN: {
    message: 'Contentful Preview API Access Token',
    validate: validate(validateContentfulAPIKey)
  },
  CONTENTFUL_MANAGEMENT_ACCESS_TOKEN: {
    message: 'Contentful Content Management API Access Token',
    validate: validate(required, validateContentfulAPIKey)
  }
}

const dotenvTemplateDefaults = {
  NODE_ENV: 'development'
}

const questions = Object.keys(dotenvKeys).map((key) => ({
  type: 'input',
  name: key,
  message: dotenvKeys[key].message,
  validate: validate(dotenvKeys[key].validate)
}))

function validateContentfulAPIKey (response) {
  return (/^[a-f0-9]{64}$/).test(response) ? Promise.resolve(true) : Promise.reject(Error(`Invalid Contentful API Key`))
}

function validateContentfulSpaceID (response) {
  return (/^[a-z0-9]{12}$/).test(response) ? Promise.resolve(true) : Promise.reject(Error(`Invalid Contentful Space ID`))
}

// UI logic
function run () {
  banner('Generate Environment File', `Generate a ${chalk.cyan(`.env`)} file that exposes environment variables such as API keys. You can generate Contentful API keys from the 'APIs' tab of your Contentful Space.

 You'll need to generate ${chalk.cyan(`delivery and preview`)} API keys, as well as a ${chalk.cyan(`content management`)} API key`)

  return inquirer.prompt(questions)
    .then((answers) => {
      const dotenv = Object.keys(dotenvTemplateDefaults).map((key) => `${key}=${dotenvTemplateDefaults[key]}`)
        .concat(Object.keys(answers).map((key) => `${key}=${answers[key]}`))
      return fs.writeFileAsync(paths.root('.env'), dotenv.join('\n'))
        .then(() => {
          console.log(tick, chalk.cyan('.env'), 'file created successfully')
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
