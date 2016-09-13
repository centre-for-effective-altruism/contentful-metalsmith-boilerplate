const path = require('path')
const helpers = path.resolve(__dirname)
const _root = path.resolve(path.join(__dirname, '..', '..'))
const tasks = path.join(_root, 'tasks')
const tools = path.join(tasks, 'tools')
const src = path.join(_root, 'src')
const build = path.join(_root, 'build')
const metalsmith = path.join(src, 'metalsmith')
const scripts = path.join(src, 'scripts')
const styles = path.join(src, 'styles')
const templates = path.join(src, 'templates')
const metalsmithContentful = path.join(metalsmith, 'contentful')
const metalsmithFonts = path.join(metalsmith, 'fonts')
const metalsmithScripts = path.join(metalsmith, 'scripts')
const metalsmithStyles = path.join(metalsmith, 'styles')
const metalsmithSettings = path.join(metalsmith, 'settings')

module.exports = {
  root: _root,
  helpers,
  tasks,
  tools,
  src,
  build,
  metalsmith,
  scripts,
  styles,
  templates,
  metalsmithContentful,
  metalsmithFonts,
  metalsmithScripts,
  metalsmithStyles,
metalsmithSettings}
