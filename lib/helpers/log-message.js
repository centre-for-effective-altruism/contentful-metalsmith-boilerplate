const Timer = require('./timer')
const chalk = require('chalk')
const pad = require('pad-number')

const methods = [
  'log',
  'info',
  'warn',
  'error',
  'success',
  'message',
  'status'
]

const methodColours = {
  log: 'white',
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  success: 'green',
  message: 'magenta',
  status: 'gray'
}

function format (message, method, timer) {
  const diff = timer.diff()
  const elapsed = timer.elapsed()
  // split time components
  const diffS = pad(diff.seconds(), 2)
  let diffM = padMS(diff.milliseconds())
  const elapsedS = pad(elapsed.seconds(), 2)
  let elapsedM = padMS(elapsed.milliseconds())
  // rounding
  elapsedM = elapsedS > 0 ? (elapsedM) : elapsedM
  const time = `[ +${diffS}.${diffM} / ${elapsedS}.${elapsedM} ]`
  const separator = '.'.repeat((80 - message.length - time.length))
  console.log([
    chalk[methodColours[method]](message),
    chalk.dim(separator),
    chalk.dim(time)
  ].join(''))
}

// general logger
function logger (timer) {
  var m = {}
  methods.forEach((method) => {
    m[method] = (message) => format(message, method, timer)
  })
  return m
}

// wrapper for metalsmith, methods available at logMessage.plugin
function plugin (timer) {
  var m = {}
  methods.forEach((method) => {
    m[method] = (message) => (files, metalsmith, done) => { format(message, method, timer); done() }
  })
  return m
}

// utility to pad milliseconds to two digits
function padMS (ms, figures = 2) {
  const p = Math.pow(10, 3 - figures)
  return pad((Math.round(ms / p) * p) / p, figures)
}

// main function
function logMessage (startImmediate = true) {
  const timer = new Timer()
  if (startImmediate) timer.start()
  return Object.assign({
    start: timer.start,
    timestamp: timer.timestamp,
    plugin: plugin(timer)
  }, logger(timer))
}

module.exports = logMessage
