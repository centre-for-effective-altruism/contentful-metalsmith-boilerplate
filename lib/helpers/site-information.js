const paths = require('./file-paths')
const site = require(paths.config('site.json'))
site.url = site.protocol + site.domain
module.exports = site
