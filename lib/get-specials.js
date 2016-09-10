var fs = require('fs')
var path = require('path')


exports.get = getSpecials;

function getSpecials(options){

	options = options || {}
	options.templateDir = options.templateDir || './src/templates'
	options.specials = options.specials || {specials} // {specialType:directory}
	options.ext = options.ext || '.jade'

	var output = {}

	Object.keys(options.specials).forEach(function(special){
		var dir = path.join(process.cwd(),options.templateDir,specials[special]);
		fs.readdir(dir,function(err,filenames){
			if (err) throw err;
			output[special] = {};
			filenames.forEach(function(special){
				output[special][path.basename(special,options.ext)] = path.join(dir,special)
			})
		});
	})
	return output;
}