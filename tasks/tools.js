const path = require('path')
const toolsPath = require('../lib/helpers/file-paths').tools

const inquirer = require('inquirer')

const tools = [
  {
    name: 'Create new Metalsmith plugin',
    value: path.join(toolsPath, 'create-metalsmith-plugin.js')
  },
  {
    name: 'Create new Content Type',
    value: path.join(toolsPath, 'create-content-type.js')
  },
  {
    name: 'Delete Content Types',
    value: path.join(toolsPath, 'delete-content-types.js')
  },
  new inquirer.Separator(),
  {
    name: 'Create default Content Types',
    value: path.join(toolsPath, 'create-default-content-types.js')
  },
  {
    name: 'Add default content to space',
    value: path.join(toolsPath, 'create-default-content-types.js')
  },
  new inquirer.Separator(),
  {
    name: 'Create an Environment Variables file (.env)',
    value: path.join(toolsPath, 'create-dotenv.js')
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
    var tool = require(answers.tool)
    return tool.run()
      .catch((err) => {
        throw err
      })
  })
