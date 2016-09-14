const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const paths = require('./file-paths')
const filter = require('minimatch').filter
const schemaPath = paths.tasks('metalsmith/content-types')
function generate () {
  return fs.readdirAsync(schemaPath)
  .then((filePaths) => {
    // generate object keys for each schema file
    let file = filePaths.filter(filter('**/!(index).js')).map((filePath) => `  ${path.basename(filePath, path.extname(filePath))}: require('./${path.basename(filePath)}')`).join(',\n')
    // wrap the schema declaration in an exports = {}
    file = `module.exports = {\n${file}\n}\n`
    return fs.writeFileAsync(path.join(schemaPath, `index.js`), file)
  })
}

module.exports = generate
