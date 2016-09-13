const Timer = require('./timer')
const moment = require('moment')
const chalk = require('chalk')

const methods = [
  'log',
  'info',
  'warn',
  'error',
  'success',
  'message'
]

const methodColours = {
  log: 'white',
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  success: 'green',
  message: 'magenta'
}

function format (message, method, timer) {
  const separator = '.'.repeat((40 - message.length))
  const diff = timer.diff()
  const elapsed = timer.elapsed()
  console.log([
    chalk[methodColours[method]](message),
    chalk.dim(separator),
    chalk.dim(`[ ${diff.asSeconds()} / ${elapsed.asSeconds()} ]`)
  ].join(''))
}

function logger (timer) {
  var m = {}
  methods.forEach((method) => {
    m[method] = (message) => format(message, method, timer)
  })
  return m
}

function logMessage () {
  const timer = new Timer()
  return Object.assign({
    start: timer.start
  }, logger(timer))
}

var l = new logMessage()
l.start()
console.log(Object.keys(l))
l.log('Test log')
l.error('Test error')
setTimeout(() => {l.message('Test delay')},1000)

// module.exports = logMessage