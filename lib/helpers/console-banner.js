// Generate a banner for a console script

const chalk = require('chalk')
const capitalize = require('capitalize')
const wordwrap = require('wordwrap')(4, 80)

var instructionDelimiter = chalk.dim(new Array(80).join('-'))

module.exports = function (opts) {
  // set options
  if (typeof opts === 'string') {
    opts = { title: opts }
  }
  opts = Object.assign({ color: 'blue' }, opts)
  // log the title banner
  console.log(chalk[opts.color].bgWhite.inverse(`[ ${capitalize.words(opts.title)}  ]`))
  // log instructions if we have them
  if (opts.instructions) {
    console.log(instructionDelimiter)
    console.log(wordwrap(opts.instructions))
    console.log(instructionDelimiter)
  } else {
    console.log('')
  }
}
