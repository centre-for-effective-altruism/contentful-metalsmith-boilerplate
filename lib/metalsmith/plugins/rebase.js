const minimatch = require('minimatch')
const debug = require('debug')('rebase')  // DEBUG=rebase

/**
 * Rebase (Metalsmith plugin)
 *
 * Rebase files matching a pattern. Transforms are applied sequentially, so subsequent transforms should account for files that may have been moved by a previous transform
 *
 * @param {Array}          transforms[] - a list of transforms to apply to the files
 * @param {string}         transforms[].pattern - a glob pattern (passed to minimatch)
 * @param {Array|function} transforms[].rebase - an Array with arguments for String.replace(...args), or a rebasing function (passed the old filename, should return the new filename)
 *
 */
function rebasePlugin (transforms) {
  const defaultTransforms = []
  transforms = Array.isArray(transforms) ? transforms : defaultTransforms
  // main plugin returned to Metalsmith
  return function rebase (files, metalsmith, done) {
    transforms.forEach((transform) => {
      debug('Using transform %o, checking files with pattern %s', transform.rebase, transform.pattern)
      Object.keys(files).filter(minimatch.filter(transform.pattern)).forEach((file) => {
        debug('Rebasing %s', file)
        let newFile
        if (Array.isArray(transform.rebase)) {
          debug('Rebasing with String.replace(), args:', ...transform.rebase)
          newFile = file.replace(...transform.rebase)
        } else if (typeof transform.rebase === 'function') {
          debug('Rebasing with a custom transform function')
          newFile = transform.rebase(file)
        } else {
          throw new TypeError('transform.rebase expects an Array of arguments for String.replace() or a replacement function')
        }
        // remove any leading slashes
        newFile = newFile.substr(0, 1) === '/' ? newFile.substr(1) : newFile
        debug('The new filename is %s', newFile)
        files[newFile] = files[file]
        delete files[file]
      })
    })
    // tell Metalsmith that we're done
    done()
  }
}

module.exports = rebasePlugin
// require this plugin in ./tasks/metalsmith using:
// const rebasePages = require(paths.lib('metalsmith/plugins/rebase.js'))
