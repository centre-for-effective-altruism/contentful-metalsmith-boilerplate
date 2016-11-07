const minimatch = require('minimatch')
const debug = require('debug')('add-children-to-parents')  // DEBUG=add-children-to-parents

/**
 * Add Children (Metalsmith plugin)
 *
 * Finds files with a `parent` set, and adds them to the `parent` file under the `children` key
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 *
 */
function addChildrenToParentsPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: '**/*.html'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function addChildrenToParents (files, metalsmith, done) {
    // plugin code goes here
    const contentfulIDMap = metalsmith.metadata().contentfulIDMap
    Object.keys(files).filter(filter).forEach((file) => {
      debug('Checking file %s', file)
      const meta = files[file]
      if (!meta.parent) return
      debug('%s has a parent', file)
      const parentFile = contentfulIDMap[meta.parent.sys.id]
      debug('Parent title is', parentFile.title)
      debug('Adding child to parent file', parentFile.title)
      parentFile.children = parentFile.children || []
      parentFile.children.push(meta)
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = addChildrenToParentsPlugin
// require this plugin in ./tasks/metalsmith using:
// const addChildren = require(paths.lib('metalsmith/plugins/add-children-to-parents.js'))
