// highlight footnotes when they're clicked
var $ = require('jQuery')
function highlightFootnotes () {
  var t
  var removeHighlights = function (timeout) {
    console.log('instantiating footnote highlighting')
    timeout = timeout || false
    clearTimeout(t)
    $('.footnote-item>p,.footnote-ref').removeClass('highlighted')
    if (timeout) {
      t = setTimeout(function () { removeHighlights() }, 10000)
    }
  }
  var parent = $(document)
  $(parent).on('click', '.footnote-ref a', function () {
    removeHighlights(true)
    $($(this).attr('href') + '>p').addClass('highlighted')
  })
  $(parent).on('click', '.footnote-backref', function () {
    removeHighlights(true)
    $($(this).attr('href')).parent('sup').addClass('highlighted')
  })
}

$(document).ready(function () {
  highlightFootnotes()
})

module.exports = highlightFootnotes
