var $LAB = require('./vendor/LAB.js')
// var $ = require('jQuery')

var d = global.d || []
// application queue

var appScript = document.getElementById('app-script').src
var appQueue = []
$LAB
  .script('https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js')
  .wait()
  .script(appScript || '/scripts/app.min.js')
  .wait(function () {
    var $chain = $LAB
    for (var i = 0; i < d.length; i++) {
      if (typeof d[i] === 'function') {
        $chain.queueWait(d[i])
      } else {
        $chain.queueScript(
          d[i].substr(d[i].length - 4) === '.js' || d[i].substr(0, 4) === 'http' ? d[i] : '/scripts/' + d[i] + '.min.js'
        )
      }
    }
    $chain.runQueue()
  })
  // enqueue anything that's been requested with loadScript() elsewhere in the body

// webfonts
$LAB
  .script('https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js')
  .wait(function () {
    global.WebFont.load({
      timeout: 1000,
      classes: !global.wfInactive,
      google: {
        families: ['Merriweather:300,300i,700,700i', 'Raleway:500,500i']
      }
    })
  })
