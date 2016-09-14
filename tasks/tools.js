const toolsPath = require('../lib/helpers/file-paths').tools

const console = require('better-console')
const inquirer = require('inquirer')

const tools = [
  {
    name: 'Create new Metalsmith plugin',
    value: toolsPath('create-metalsmith-plugin.js')
  },
  {
    name: 'Create new Content Type',
    value: toolsPath('create-content-type.js')
  },
  {
    name: 'Delete Content Types',
    value: toolsPath('delete-content-types.js')
  },
  new inquirer.Separator(),
  {
    name: 'Create default Content Types',
    value: toolsPath('create-default-content-types.js')
  },
  {
    name: 'Add default content to space',
    value: toolsPath('create-default-content.js')
  },
  new inquirer.Separator(),
  {
    name: 'Create an Environment Variables file (.env)',
    value: toolsPath('create-dotenv.js')
  }
]

// choose which tool to run via prompt
const questions = [
  {
    name: 'tool',
    type: 'list',
    message: `What do you want to do?`,
    choices: tools
  }
]

inquirer.prompt(questions)
  .then((answers) => {
    console.log('\n\n')
    const tool = require(answers.tool)
    return tool.run()
  })
  .catch((err) => {
    console.error(`${err.name}:`, err.message)
    console.trace(err)
  })
