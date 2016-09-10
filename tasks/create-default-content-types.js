const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const console = require('better-console');
const chalk = require('chalk');
const banner = require('../lib/helpers/console-banner');

const generate = require('./create-content-type');



var contentTypes = [
	{
		name: 'Page',
		id: 'page',
		description: 'A basic web page',
		fields: 'page-schema-fields.json',
		successMessage: [
			`You should change the 'Appearance' setting for the ${chalk.cyan('Layout')} field to 'Radio'`
		]
	},
	{
		name: 'Post',
		id: 'post',
		description: 'A blog post',
		collection: true,
		collectionPerPage: 10
	},
	{
		name: 'Series',
		id: 'series',
		description: 'A collection of content in a particular order (e.g. a navigation menu, or a series of blog posts)',
		bodyField: false,
		fields: 'series-schema-fields.json'
	}
];

banner('Creating default content types');
console.log(chalk.white.dim(`(${contentTypes.map((c) => c.name).join(', ')})`));

return Promise.all(contentTypes.map((contentType) => {
	// prepare content types, including reading in JSON schema for additional fields
	if (contentType.fields) {
		return fs.readFileAsync(path.join(__dirname,'content-type-schemas',contentType.fields))
		.then((schemaFieldsFile) => {
			var fields = { fields: JSON.parse(schemaFieldsFile) };
			return Object.assign({}, contentType, fields)
		})
	}
	return new Promise((resolve) => resolve(contentType));
}))
.then(function(contentTypes){
	return generate(contentTypes);
})