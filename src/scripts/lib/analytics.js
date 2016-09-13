var $ = require('jQuery')
var document

$(document).ready(function () {
  // track outbound link clicks
  $('a').filter(function () {
    return this.hostname && this.hostname !== global.location.hostname
  }).on('click', function (event) {
    event.preventDefault()
    // send analytics event
    var analytics = global.analytics
    var linkURL = this.href
    var linkTarget = this.target
    if (analytics.initialize) {
      analytics.track('Clicked outbound link', {
        category: 'Links',
        label: linkURL
      }, function () {
        open(linkURL, linkTarget)
      })
    } else {
      open(linkURL, linkTarget)
    }
    // actually open the URL
    function open (url, target) {
      if (target) {
        global.open(url, target)
      } else {
        global.location.href = url
      }
    }
  })
})
