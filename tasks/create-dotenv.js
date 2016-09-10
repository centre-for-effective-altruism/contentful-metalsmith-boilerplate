// Generate the .env file

const Promise = require('bluebird');

const inquirer = require('inquirer');
const validation = require('../lib/helpers/inquirer-validation');
const validate = validation.validate;
const required = validation.required;

const chalk = require('chalk');
const wordwrap = require('wordwrap')(64);
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const tick = chalk.green('✓');
const banner = require('../lib/helpers/console-banner');


const dotenvKeys = {
	CONTENTFUL_SPACE: {
		message: 'Contentful Space ID',
		validate: [required,validateContentfulSpaceID]
	},
	CONTENTFUL_DELIVERY_ACCESS_TOKEN: {
		message:'Contentful Delivery API Access Token',
		validate: [required,validateContentfulAPIKey]
	},
	CONTENTFUL_PREVIEW_ACCESS_TOKEN: {
		message:'Contentful Preview API Access Token',
		validate: [validateContentfulAPIKey]
	},
	CONTENTFUL_MANAGEMENT_ACCESS_TOKEN: {
		message: 'Contentful Content Management API Access Token',
		validate: [required,validateContentfulAPIKey]
	},
};

const dotenvTemplateDefaults = {
	NODE_ENV: 'development'
};

const questions = Object.keys(dotenvKeys).map((key) => ({
	type: 'input',
	name: key,
	message: dotenvKeys[key].message,
	validate: validate(dotenvKeys[key].validate)
}));



function validateContentfulAPIKey (response) {
	return (/^[a-f0-9]{64}$/).test(response) ? true : `Invalid Contentful API Key`;
}

function validateContentfulSpaceID (response) {
	return (/^[a-z0-9]{12}$/).test(response) ? true : `Invalid Contentful Space ID`;
}

// UI logic

banner('Generate Environment File', `Generate a ${chalk.cyan(`.env`)} file that exposes environment variables such as API keys. You can generate Contentful API keys from the 'APIs' tab of your Contentful Space.\n\n You'll need to generate ${chalk.cyan(`delivery and preview`)} API keys, as well as a ${chalk.cyan(`content management`)} API key`)

inquirer.prompt(questions)
.then((answers) => {
	const dotenv = Object.keys(dotenvTemplateDefaults).map((key) => `${key}=${dotenvTemplateDefaults[key]}`)
		.concat(Object.keys(answers).map((key) => `${key}=${answers[key]}`));
	return fs.writeFileAsync(path.join(__dirname,'..','.env'),dotenv.join('\n'))
	.then(() => {
		console.log(tick,chalk.cyan('.env'),'file created successfully')
	});
});

