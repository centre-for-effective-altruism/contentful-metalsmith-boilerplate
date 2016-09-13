var chalk = require('chalk')
console.log(chalk.bold.cyan.inverse('Processing Javascript files'))

var Promise = require('bluebird')

var fs = Promise.promisifyAll(require('fs'))
fs.existsAsync = Promise.promisify(function exists (path, cb) {
  fs.exists(path, function (exists) { cb(null, exists); })
})

var path = require('path')
var rm = require('rimraf')
var cp = require('ncp')

var Browserify = require('browserify')
var uglify = Promise.promisifyAll(require('uglify-js'))

var filter = require('minimatch').filter

var srcPath = path.join(__dirname, '..', 'src', 'scripts')
var destPath = path.join(__dirname, '..', 'src', 'metalsmith', 'scripts')
var builtPath = path.join(__dirname, '..', 'build', 'scripts')

var scripts = []

new Promise(function (resolve, reject) {
  rm(destPath, function (err) {
    if (err) reject(err)
    resolve()
  })
})
  .then(function () {
    return fs.mkdirAsync(destPath)
      .catch(function (err) {if (err.code !== 'EEXIST') throw err})
  })
  .then(function () {
    return fs.readdirAsync(srcPath)
  })
  .then(function (files) {
    // split files into includes and bundles
    var bundles = files.filter(filter('*.js'))
    // object to hold all async operations

    // bundle files
    var promises = []
    promises.push(
      Promise.all(bundles.map(function (file) {
        return bundle(path.join(srcPath, file))
      }))
        .then(function (bundles) {
          scripts.push(...bundles)
          console.log(chalk.green.bold('✓ All files bundled!'))
        })
    )
    return Promise.all(promises)
  })
  .then(function () {
    console.log(chalk.dim('Writing files to destination directory...'))
    return Promise.all(scripts.map(function (script) {
      return Promise.all([
        fs.writeFileAsync(path.join(destPath, script.fileName), script.src),
        fs.writeFileAsync(path.join(destPath, script.fileName + '.map'), script.map)
      ])
    }))
      .then(function () {
        console.log(chalk.green.bold('✓ All files written!'))
      })
  })
  .then(function (cleaned) {
    return fs.existsAsync(builtPath)
      .then(function () {
        return new Promise(function (resolve, reject) {
          cp(destPath, builtPath, function (err) {
            if (err) reject(err)
            resolve()
          })
        })
      })
      .then(function () {
        console.log(chalk.green.bold('✓ Files copied to build directory!'))
      })
      .catch(function (err) {
        if (err.length === 1 && err[0].code === 'ENOENT') {
          // no build directory, don't bother doing anything
        } else {
          throw err
        }
      })
  })
  .catch(function (err) {
    throw err
  })

function recursive (directory) {
  return new Promise(function (resolve, reject) {
    recursiveReaddir(directory, function (err, files) {
      if (err) reject(err)
      resolve(files)
    })
  })
}

function minify (file) {
  return new Promise(function (resolve, reject) {
    var fileName = path.basename(file).replace('.js', '.min.js')
    console.log(chalk.dim('+ Creating'), chalk.dim.underline(fileName))
    try {
      var minified = uglify.minify(file, {
        outSourceMap: './' + fileName + '.map'
      })
    } catch(e) {
      reject(e)
    }

    console.log(chalk.green.dim('✓ Created'), chalk.dim.underline(fileName))
    resolve({
      src: Buffer.from(minified.code),
      map: Buffer.from(minified.map),
    fileName})
  })
}

function bundle (file) {
  return new Promise(function (resolve, reject) {
    var fileName = path.basename(file).replace('.js', '.min.js')
    console.log(chalk.dim('+ Creating'), chalk.dim.underline(fileName))
    // start browserify
    var browserify = new Browserify({debug: true})
    // add the entry file to the queue
    browserify.add(file)
    // add minifier / sourcemap generator
    var map = process.env.NODE_ENV === 'production' ? false : `./${fileName}.map`
    browserify.plugin('minifyify', {map: map, minify: true})
    // call the main bundle function
    browserify.bundle(function (err, src, map) {
      if (err) reject(err)
      console.log(chalk.green.dim('✓ Created'), chalk.dim.underline(fileName))
      resolve({
        src: src,
        map: map,
      fileName})
    })
  })
}

function copyFile (source, target) {
  return new Promise(function (resolve, reject) {
    var rd = fs.createReadStream(source)
    rd.on('error', reject)
    var wr = fs.createWriteStream(target)
    wr.on('error', reject)
    wr.on('finish', function () {
      console.log(chalk.green.dim('✓ Copied'), chalk.dim.underline(path.basename(target)))
      resolve()
    })
    rd.pipe(wr)
  })
}
