// Remap Layout Names - Map human-headable Layout names to filenames
//    Rationale:
//    Contentful doesn't have a good way to create easily editable key-value
//    pairs. So, if you want to give your editors a nice way of choosing a
//    layout (say, a Short Text/List field with the appearance set to 'Radio')
//    then you have to map the radio button label to the corresponding filename
const minimatch = require('minimatch')
const debug = require('debug')('remap-layout-names') // DEBUG=remap-layout-names

function remapLayoutNamesPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html',
    'Home Page': 'home.pug',
    'Basic Page': 'page.pug'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string'
    ? minimatch.filter(options.filter)
    : filter
  // main plugin returned to Metalsmith
  return function remapLayoutNames (files, metalsmith, done) {
    // copy options, remove the 'filter' key
    const layoutSubstitutions = Object.assign({}, options)
    delete layoutSubstitutions.filter
    const layoutKeys = Object.keys(layoutSubstitutions)
    Object.keys(files).filter(filter).forEach((file) => {
      const meta = files[file]
      if (meta.layout && layoutKeys.indexOf(meta.layout) > -1) {
        meta.layout = layoutSubstitutions[meta.layout]
      }
    })
    done()
  }
}

module.exports = remapLayoutNamesPlugin
// require this plugin in ./tasks/metalsmith using:
// const remapLayoutNames = require(paths.lib('metalsmith/plugins/remap-layout-names.js'))
