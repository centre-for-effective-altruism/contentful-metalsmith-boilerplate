var chalk = require('chalk');
console.log(chalk.bold.yellow.inverse('Processing Stylesheet files'));

var Promise = require('bluebird')


var fs = require('fs');
Promise.promisifyAll(fs);
fs.existsAsync = Promise.promisify (function exists(path, cb) {
    fs.exists(path, function (exists) { cb(null, exists); });
});

var path = require('path')

var cp = require('ncp')
var rm = require('rimraf')

var sass = Promise.promisifyAll(require('node-sass'));
var cleanCSS = Promise.promisifyAll(require('clean-css'));

var srcFile = path.join(__dirname,'..','src','styles','styles.scss');
var destPath = path.join(__dirname,'..','src','metalsmith','styles')
var builtPath = path.join(__dirname,'..','build','styles')

new Promise(function(resolve,reject){
	rm(destPath,function(err){
		if(err) reject(err);
		resolve();
	})
})
.then(function(){
	return fs.mkdirAsync(destPath)
	.catch(function(err){if(err.code !== 'EEXIST') throw err})
})
.then(function(){
	return sass.renderAsync({
	  file: srcFile,
	  outFile: 'app.css',
	  sourceMap: 'app.css.map'

	})
	.then(function(css){
		console.log(chalk.green.bold('✓ Processed SASS into CSS'));
		return css;
	})
})
.then(function(css){
	var clean = new cleanCSS({
		sourceMap: css.map.toString(),
		debug:true
	})
	Promise.promisifyAll(clean);
	return clean.minifyAsync(css.css)
	.then(function(cleaned){
		console.log(chalk.green.bold('✓ Cleaned CSS'));
		return cleaned;
	})
	;
})
.then(function(cleaned){
	var files = {};
	files['app.min.css'] = cleaned.styles.toString() + '\n/*# sourceMappingURL=./app.min.css.map */';
	files['app.min.css.map'] = cleaned.sourceMap;
	return Promise.all(Object.keys(files).map(function(fileName){
		return fs.writeFileAsync(path.join(destPath,fileName),files[fileName]);
	}))
	.then(function(){
		console.log(chalk.green.bold('✓ All files saved!'));
	})
})
.then(function(cleaned){
	return fs.existsAsync(builtPath)
	.then(function(){
		return new Promise(function(resolve,reject){
			cp(destPath,builtPath,function(err){
				if(err) reject(err);
				resolve();
			})
		})
	})
	.then(function(){
		console.log(chalk.green.bold('✓ Files copied to build directory!'));
	})
	.catch(function(err){
		if(err.length === 1 && err[0].code==='ENOENT'){
			// no build directory, don't bother doing anything
		} else {
			throw err;
		}
	})
})
.catch(function(err){
	throw err;
})
