
const path = require('path')
// initialise the only two direct references
const paths = {
  root: path.resolve(path.join(__dirname, '..', '..')),
  helpers: path.resolve(__dirname),
  lib: path.resolve(__dirname, '..')
}
// initialise everything that uses an internal reference
paths.tasks = path.join(paths.root, 'tasks')
paths.tools = path.join(paths.tasks, 'tools')
paths.src = path.join(paths.root, 'src')
paths.config = path.join(paths.root, 'config')
paths.build = path.join(paths.root, 'build')
paths.metalsmith = path.join(paths.src, 'metalsmith')
paths.scripts = path.join(paths.src, 'scripts')
paths.styles = path.join(paths.src, 'styles')
paths.layouts = path.join(paths.src, 'layouts')
paths.templates = path.join(paths.src, 'templates')
paths.metalsmithFonts = path.join(paths.metalsmith, 'fonts')
paths.metalsmithScripts = path.join(paths.metalsmith, 'scripts')
paths.metalsmithStyles = path.join(paths.metalsmith, 'styles')
paths.metalsmithSettings = path.join(paths.metalsmith, 'settings')

// turn each path into a method call
const methods = {}
Object.keys(paths).forEach((p) => {
  methods[p] = (additionalPaths) => path.normalize(path.join(paths[p], additionalPaths || '.'))
})
// export the methods
module.exports = methods
