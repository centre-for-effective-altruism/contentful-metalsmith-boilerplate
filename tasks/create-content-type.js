// create a new content type in Contenful with some opinionated defaults,
// namely, with Title, Slug, and Body fields

const Contentful = require('contentful-content-management');
const Promise = require('bluebird');

const inquirer = require('inquirer');
const validation = require('../lib/helpers/inquirer-validation');
const validate = validation.validate;
const required = validation.required;

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const slug = require('slug'); slug.defaults.mode = 'rfc3986';
const capitalize = require('capitalize');
const camelCase = require('camelcase');
const trim = require('trim');

const console = require('better-console');
const chalk = require('chalk');
const tick = chalk.green('✓');
const submsgPrefix = '   > ';
const banner = require('../lib/helpers/console-banner');

const schemaFilePath = path.join(__dirname,'content-type-schemas','default-schema.json');

const contentful = new Contentful();


// main function
function generate(contentTypes){
    // if we've only been given a single content type, bump it into an array
    if (!Array.isArray(contentTypes)){
        contentTypes = [contentTypes];
    }
    // read in our default schema 
    return fs.readFileAsync(schemaFilePath)
    .then((schemaFile) => {
        console.info('Connecting to Contentful');
        return contentful.space((space) => {
            // Get an array of promises for the creation of each content type
            var promises = contentTypes.map((data) => {
                
                // Build a schema for this content type from our JSON file
                const schema = JSON.parse(schemaFile.toString()
                  .replace(/<%CONTENTTYPENAME%>/g, data.name)
                  .replace(/<%CONTENTTYPEDESCRIPTION%>/g, data.description));

                // get rid of the Body field if we don't need it
                if (data.bodyField === false){
                    schema.fields = schema.fields.filter((field) => !(field.id==='body'))
                }

                // get rid of the Slug field if we don't need it
                if (data.slugField === false){
                    schema.fields = schema.fields.filter((field) => !(field.id==='slug'))
                } else {
                    data.successMessage = data.successMessage || [];
                    data.successMessage.push(`You should change the 'Appearance' setting for the ${chalk.cyan('Slug')} field to 'Slug'`)
                }
                
                // add any additional fields to the schema
                if (data.fields){
                    schema.fields = schema.fields.concat(data.fields);
                }

                // send the data to Contentful
                console.info('Generating Content Type',chalk.cyan(data.name),chalk.dim(`(${data.id})`));
                return space.createContentTypeWithId(data.id, schema)
                .then((contentType) => {
                    console.info(tick,chalk.cyan(data.name),'created successfully!')
                    // publish the content type if we haven't explicity said not to
                    if (!(data.publish === false)) {
                        return contentType.publish()
                        .then(() => {
                            console.info(tick,chalk.cyan(data.name),'published successfully!')
                        })
                    }
                    return true;
                })
                .then(() => {
                    if(data.collection) {
                        console.log('Do something with collections...');
                    }
                })
                .then(() => {
                    if(data.successMessage) {
                        console.info(`Content Type: ${chalk.cyan(data.name)}`);
                        data.successMessage.forEach((message) => {
                            console.log(submsgPrefix, chalk.magenta(message));
                        })
                    }
                })
                .catch((err) => {
                    console.warn(`Could not create Content Type ${chalk.cyan(data.name)}`);
                    var errData = JSON.parse(err.message)
                    if(errData.status === 409){
                        console.error(submsgPrefix,'Content Type appears to exist!');
                    } else {
                        console.warn('Contentful returned the following error:');
                        console.error(submsgPrefix,errData.status,errData.statusText)
                    }

                })
            });
            return Promise.all(promises);
        })
        .catch((err) => {
            throw err;
        })
    })
}


// export the generates() function so we can call it programmatically
if ( !(require.main === module) ){
    module.exports = generate;
// otherwise run as a CLI
} else {

    banner('Create a new Contentful Content Type');

    var questions = [
        {
            type: 'input',
            name: 'name',
            message: 'Content Type Name (e.g. Page, Person)',
            validate: validate(required,validName),
            filter: (response) => capitalize.words(trim(response))
        },
        {
            type: 'input',
            name: 'id',
            message: 'Content Type ID (used by the API).',
            default: (answers) => camelCase(capitalize.words(slug(answers.name))),
            filter: (response)  => camelCase(capitalize.words(slug(trim(response)))),
            validate: validate(required,validID)
        },
        {
            type: 'input',
            name: 'description',
            message: 'Content Type Description (additional information about this Content Type)'
        },
        {
            type: 'confirm',
            name: 'slugField',
            message: 'Include a "Slug" field? (recommended)',
            default: true
        },
        {
            type: 'confirm',
            name: 'bodyField',
            message: 'Include a "Body" field for Markdown content?',
            default: true
        },
        {
            type: 'confirm',
            name: 'publish',
            message: 'Publish this Content Type immediately?',
            default: true
        },
        {
            type: 'confirm',
            name: 'collection',
            message: 'Does this Content Type need a collection page (e.g. a single page that collects all Posts/Tags/People etc)?',
            default: false
        },
        {
            type: 'input',
            name: 'collectionPerPage',
            message: (answers) => `How many individual ${chalk.cyan(answers.name)} items should be on each collection page?`,
            default: 10,
            filter: parseInt,
            validate: validate(validInt),
            when: (answers) => answers.collection

        }
    ]

    inquirer.prompt(questions)
    .then((answers) => generate(answers));
}

// validations for CLI
function validName(response) {
    return (/[A-Z][a-zA-Z\s]+/).test(response) ? true : 'Not a valid Name. Use only letters (A-z) and spaces';
}

function validID(response){
    return (/[a-zA-Z0-9\-_]+/).test(response) ? true : 'Not a valid ID. Use only letters, numbers, spaces, dashes and underscores';
}

function validInt(response){
    return Number.isInteger(response) && response >= 0 ? true : 'Enter a whole number greater than or equal to zero';
}

