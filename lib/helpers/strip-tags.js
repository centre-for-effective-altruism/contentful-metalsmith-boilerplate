// strip out HTML & decode entities for using HTML in Jade attributes (e.g. descriptions)
const striptags = require('striptags')
const htmlEntities = require('html-entities').Html5Entities
const strip = function (input) {
  function subs (input) {
    const substitutions = [
        ['&#xA0;', ' '],
        ['&nbsp;', ' ']
    ]
    let i = striptags(input)
    substitutions.forEach((substitution) => {
      i = i.replace(substitution[0], substitution[1])
    })
    return i
  }
  return htmlEntities.decode(subs(input))
}

module.exports = strip
