// get a fully-qualified image url from a contentful image field, with optional query
var url = require('url')

const contentfulImage = (image, query = {}) => {
  const src = url.parse(image.fields.file.url, true)
  if (src.search) delete src.search
  src.query = Object.assign({}, src.query, query)
  src.protocol = 'https'
  return url.format(src)
}

module.exports = contentfulImage
