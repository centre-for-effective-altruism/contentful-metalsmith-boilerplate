const minimatch = require('minimatch')
const debug = require('debug')('create-series-hierarchy')  // DEBUG=create-series-hierarchy
const paths = require('../../helpers/file-paths') // helper to get build system paths

/**
 * Create Series Hierarchy (Metalsmith plugin)
 *
 * Recursively walk the 'Series' Content Type, which nests other types of
 * content, and add the resulting tree to the Metalsmith metadata. Depends on
 * there being a map of Contentful IDs and Metalsmith files (e.g. the one
 * created by the `createContentfulFileIdMap` plugin)
 *
 * @param {Object}          opts - plugin options
 * @param {(Object|string)} opts.filter - a glob pattern (passed to minimatch) or a filter function compatible with Array.filter() (will be passed Metalsmith filenames)
 * @param {string}          opts.mapName - the name of the Contentful file ID map created by the `createContentfulFileIdMap()` plugin
 *
 */
function createSeriesHierarchyPlugin (opts) {
  const defaults = {
    // set some default options here
    filter: 'series/**/*.html',
    mapName: 'contentfulIDMap'
  }
  const options = Object.assign(defaults, opts)
  const filter = typeof options.filter === 'string' ? minimatch.filter(options.filter) : filter
  // main plugin returned to Metalsmith
  return function createSeriesHierarchy (files, metalsmith, done) {
    const defaultItem = {
      file: {},
      type: '',
      children: []
    }
    const fileIDMap = metalsmith.metadata()[options.mapName]
    // recursive function to traverse series
    function getChildren (data, seriesSlug) {
      const children = []
      if (data.sys.contentType.sys.id === 'series' && data.fields.items && data.fields.items.length > 0) {
        data.fields.items.forEach(function (child) {
          const childItem = Object.assign({}, defaultItem)
          childItem.file = fileIDMap[child.sys.id]
          if (!childItem.file) {
            // file is probably archived or unpublished
            return
          }
          childItem.type = childItem.file.data.sys.contentType.sys.id
          childItem.children = getChildren(child)
          children.push(childItem)
        })
      }
      if (seriesSlug) {
        children.forEach(function (child, index) {
          // assign series info to original file
          child.file.series = child.file.series || {}
          child.file.series[seriesSlug] = {
            previous: index > 0 ? children[index - 1] : false,
            next: index < children.length - 1 ? children[index + 1] : false
          }
        })
      }
      return children
    }
    const series = {}
    // build a hierarchy of item IDs
    Object.keys(files).filter(filter).forEach(function (file) {
      const s = Object.assign({}, defaultItem)
      s.file = fileIDMap[files[file].data.sys.id]
      s.type = fileIDMap[files[file].data.sys.contentType.sys.id]
      s.children = getChildren(files[file].data, files[file].slug)
      series[files[file].slug] = s
    })
    metalsmith.metadata().seriesSets = series
    done()
  }
}

module.exports = createSeriesHierarchyPlugin
// require this plugin in ./tasks/metalsmith using:
// const createSeriesHierarchy = require(paths.lib('metalsmith/plugins/create-series-hierarchy.js'))
