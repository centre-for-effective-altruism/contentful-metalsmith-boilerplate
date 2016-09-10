const Contentful = require('contentful-content-management');

const inquirer = require('inquirer');

const console = require('better-console');
const chalk = require('chalk');
const tick = chalk.green('✓');
const submsgPrefix = '   > ';
const banner = require('../lib/helpers/console-banner');

const wordwrap = require('wordwrap')(64);






const contentful = new Contentful();
let contentTypes;


banner('Delete a Contentful Content Type','This utility allows you to delete Content Types from Contentful. Use with caution!');

contentful.space((space) => {
	console.info('Getting existing Content Types')
	space.getContentTypes()
	.then((contentTypesCollection) => {
		contentTypes = contentTypesCollection.items;
		const questions = [];

		questions.push({
			type: 'checkbox',
			name: 'contentTypes',
			message: `Choose Content Types to delete:`,
			choices: contentTypes.map((contentType) => ({
				name: contentType.name,
				value: contentType.sys.id,
				// disabled: (answers) => answers.filter((a) => a.value === '*').length
			}))
			.concat([{
				name: chalk.red('All Content Types'),
				value: '*',
				short: chalk.red('All')
			}]),
			filter: (answers) => (answers.filter((a) => a === '*').length ? contentTypes.map((c) => c.sys.id) : answers)
		})

		questions.push({
			type: 'confirm',
			name: 'confirmOnce',
			message:  (answers) => chalk.yellow(`You have chosen to delete the following Content Types: ${answers.contentTypes.map((c) => chalk.cyan(getContentTypeName(c))).join(', ')}. Are you 100% sure you want to do this? ${chalk.red('This cannot be undone!')}`),
			default: false,
			when: (answers) => answers.contentTypes.length
		});

		questions.push({
			type: 'confirm',
			name: 'confirmTwice',
			message: chalk.yellow(`You're really, really sure?`),
			default: false,
			when: (answers) => answers.confirmOnce
		});

		return inquirer.prompt(questions)
		.then((answers) => {
			// if we don't have any content types to delete, get out of here
			if (!answers.contentTypes.length || !(answers.confirmOnce && answers.confirmTwice) ) {
				console.info('No content types were deleted.');
				return true;
			}
			console.info('Deleting Content Types...');
			// filter content types that we've marked for deletion, then run a queue to delete them
			const contentTypesToDelete = contentTypes.filter((contentType) => answers.contentTypes.indexOf(contentType.sys.id) > -1 );
			const promises = contentTypesToDelete.map((contentType) => {
				return Promise.resolve(contentType)
				.then((contentType) => {
					// check that the content type is not published
					if(contentType.isPublished()){
						console.info(`Unpublishing ${contentType.name}`)
						return contentType.unpublish()
						.then((contentType) => {
							console.info(tick,`Successfully unpublished ${contentType.name}`)
							return contentType;
						})
					}
					return Promise.resolve(contentType);
				})
				.then((contentType) => {
					// delete the content type
					console.info(`Deleting ${contentType.name}`)
					return contentType.delete()
					.then(() => {
						console.info(tick,`Successfully deleted ${contentType.name}`)
					})
				})
				.catch((err) => {
					let error;
					try { 
						error = JSON.parse(err.message);
					} catch(e) {
						error = err
					}
					console.warn(`Could not delete ${contentType.name}:`);
					console.error(submsgPrefix,error.message);
				})
			})

			return Promise.all(promises);
		})
		.catch((err) => {
			console.error(err)
			throw err;
		});
	})
	.catch((err) => {
		throw err;
	})
})


// Utility function to get a content type's name from its ID
function getContentTypeName(contentTypeId){
	if (!contentTypes) throw new Error('Cannot get Content Type name, there are no Content Types defined');
	return contentTypes
	.filter((contentType) => contentType.sys.id === contentTypeId)
	.map((contentType) => contentType.name)[0] || 'Unknown Content Type';
}