const moment = require('moment')

function timer (format) {
  format = format || ''
  let start
  let lastCheck

  function updateCheck () {
    lastCheck = moment()
  }

  return {
    start: () => { start = moment(); updateCheck() },
    diff: () => { const e = moment().diff(lastCheck); updateCheck(); return moment.duration(e) },
    elapsed: () => moment.duration(moment().diff(start))
  }
}

module.exports = timer
