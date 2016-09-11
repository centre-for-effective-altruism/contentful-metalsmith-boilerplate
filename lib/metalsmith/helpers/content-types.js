// generate information about each content type for use with various metalsmith plugins

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const paths = require('../../helpers/file-paths');
const path = require('path');

const schemaPath = path.join(paths.tasks,'metalsmith','content-types');

// get schema for each content type
module.exports = function(){
	return fs.readdirAsync(schemaPath)
	.then((fileNames) => fileNames.map((fileName) => path.join(schemaPath,fileName)))
	.then((filePaths) => {
		return filePaths;

		/// Should expose functions that create
		// - contentful source files that can be added to the metalsmith build
		// - collection schemas
		// - pagination schemas

	})
}