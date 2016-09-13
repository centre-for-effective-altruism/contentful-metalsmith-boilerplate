// Generate a banner for a console script

const chalk = require('chalk')
const wordwrap = require('wordwrap')(4, 60)

var instructionDelimiter = chalk.dim(new Array(65).join('-'))

module.exports = function (title = '* No title *' , instructions) {
  console.log(chalk.bold.bgBlue(`[ ${(title)}  ]`))

  if (instructions) {
    console.log(instructionDelimiter)
    console.log(wordwrap(instructions))
    console.log(instructionDelimiter)
  } else {
    console.log('')
  }
}
