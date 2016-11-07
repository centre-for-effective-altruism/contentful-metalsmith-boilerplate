const minimatch = require('minimatch')
const debug = require('debug')('create-content-hierarchy')  // DEBUG=create-content-hierarchy

/**
 * Create Content Hierarchy (Metalsmith plugin)
 *
 * Finds any content with a parent, and organises it underneath the parent's folder
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 *
 */
function createContentHierarchyPlugin (opts) {
  const defaults = {
    filter: '**/index.html'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function createContentHierarchy (files, metalsmith, done) {
    function getParents (child, parentPath) {
      parentPath = parentPath || []
      var parent = metalsmith.metadata().contentfulIDMap[child.parent.sys.id]
      // add the parent path to the path array
      parentPath.unshift(parent.slug)
      // check if the parent is itself a child
      if (parent.parent) {
        parentPath = getParents(parent, parentPath)
      }
      return parentPath
    }
    Object.keys(files).filter(filter).forEach((file) => {
      debug('Checking %s', file)
      var meta = files[file]
      // work which items have parents
      if (!meta.parent) return
      debug('%s has a parent set', file)
      const parentPath = getParents(meta).join('/')
      const newPath = file.replace(meta.slug, `${parentPath}/${meta.slug}`)
      debug(`The file's new path will be %s`, newPath)
      files[newPath] = meta
      delete files[file]
    })
    done()
  }
}

module.exports = createContentHierarchyPlugin
// require this plugin in ./tasks/metalsmith using:
// const createContentHierarchy = require(paths.lib('metalsmith/plugins/create-content-hierarchy.js'))
