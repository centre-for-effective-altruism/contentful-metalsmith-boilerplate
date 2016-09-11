// create a new content type in Contenful with some opinionated defaults,
// namely, with Title, Slug, and Body fields

const Contentful = require('contentful-content-management');
const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const filePaths = require('../../lib/helpers/file-paths')

const inquirer = require('inquirer');
const validation = require(path.join(filePaths.helpers,'inquirer-validation'));
const validate = validation.validate;
const required = validation.required;


const slug = require('slug'); slug.defaults.mode = 'rfc3986';
const capitalize = require('capitalize');
const camelCase = require('camelcase');
const trim = require('trim');
const pluralize = require('pluralize');

const contentfulFieldWarnings = require(path.join(filePaths.helpers,'contentful-field-warnings'));
const wordwrap = require('wordwrap')(64);


const yaml = require('js-yaml');

const console = require('better-console');
const chalk = require('chalk');
const tick = chalk.green('✓');
const submsgPrefix = '   > ';
const banner = require(path.join(filePaths.helpers,'console-banner'));


const defaultSchemaFilePath = path.join(filePaths.tools,'content-type-schemas','default-schema.json');
const contentfulFilesFilePath = filePaths.metalsmithContentful;

const contentful = new Contentful();


// main function
function generate(contentTypeData){
    // if we've only been given a single content type, bump it into an array
    if (!Array.isArray(contentTypeData)){
        contentTypeData = [contentTypeData];
    }
    // read in our default schema 
    return fs.readFileAsync(defaultSchemaFilePath)
    .then((schemaFile) => {
        console.info('Connecting to Contentful');
        return contentful.space((space) => {
            // Get an array of promises for the creation of each content type
            var promises = contentTypeData.map((data) => {
                
                // Build a schema for this content type from our JSON file
                const schema = JSON.parse(schemaFile.toString()
                  .replace(/<%CONTENTTYPENAME%>/g, data.name)
                  .replace(/<%CONTENTTYPEDESCRIPTION%>/g, data.description));

                // get rid of the Short Title field if we don't explicitly require it
                if ( !(data.shortTitleField === true)) {
                    schema.fields = schema.fields.filter((field) => !(field.id==='shortTitle'))
                }

                // get rid of the Body field if we don't need it
                if (data.bodyField === false){
                    schema.fields = schema.fields.filter((field) => !(field.id==='body'))
                }

                // get rid of the Slug field if we don't need it
                if (data.slugField === false){
                    schema.fields = schema.fields.filter((field) => !(field.id==='slug'))
                } else {
                    data.contentfulFieldWarnings = data.contentfulFieldWarnings || [];
                    data.contentfulFieldWarnings.push(contentfulFieldWarnings.appearance('Slug','Slug'));
                }
                
                // add any additional fields to the schema
                if (data.fields){
                    schema.fields = schema.fields.concat(data.fields);
                }

                // send the data to Contentful
                return Promise.resolve()
                .then(() => {
                    console.info('Creating Content Type',chalk.cyan(data.name),chalk.dim(`(${data.id})`));
                    return space.createContentTypeWithId(data.id, schema)
                    .then((contentType) => {
                        console.info(tick,chalk.cyan(data.name),'created successfully!');
                        return contentType.publish()
                        .then((contentType) => {
                            console.info(tick,chalk.cyan(data.name),'published successfully!');
                            return contentType;
                        });
                    })
                    .catch((err) => {
                        console.warn(`Could not create Content Type ${chalk.cyan(data.name)}`);
                        try {
                            var errData = JSON.parse(err.message)
                            console.warn('Contentful returned the following error:');
                            console.error(submsgPrefix,err.name);
                            console.error(submsgPrefix,errData.status,errData.statusText);
                            console.error(submsgPrefix,errData);
                        } catch(e) {
                            console.error(submsgPrefix,err.name);
                            console.error(submsgPrefix,err.message);
                        }
                    })
                })
            });
            return Promise.all(promises)
            .then(() => Promise.all(contentTypeData.map((data) => Promise.resolve()
                // Postprocessing...
                .then(() => {
                    // create a schema with some details about the content type
                    const contentTypeSchema = {
                        name: data.name,
                        contentType: data.id,
                        slugField: data.slugField ? ':fields.slug' : ':sys.id',
                        plural: data.plural,
                        collection: {
                            sort: data.collectionSortField || 'title',
                            reverse: data.collectionSortReverse,
                        },
                        createPage: data.createPage === false ? false : true
                    };
                    if (data.pagination) {
                        contentTypeSchema.pagination = {
                            perPage: data.paginationPerPage
                        }
                    }
                    const contentTypeSchemaFile = `module.exports = ${JSON.stringify(contentTypeSchema,null,'    ')}`;
                    const ccontentTypeSchemaFilePath = path.join(filePaths.tasks,'metalsmith','content-types',`${data.id}.js`);
                    return fs.writeFileAsync(ccontentTypeSchemaFilePath, contentTypeSchemaFile)
                    .then(() => {
                        console.info(tick, `Created schema for ${chalk.cyan(data.plural)}`);
                    });
                })
                .catch((err) => {
                    console.warn(`An error occurred while postprocessing Content Type ${data.name}`);
                    console.error(submsgPrefix,err.name);
                    console.error(submsgPrefix,err.message);
                })
            )))
            .then(() => {
                // display help information about fields that need to be manually changed in Contentful
                var first = true;
                var delimiter = chalk.dim('--------');
                contentTypeData.forEach((data) => {
                    if(data.contentfulFieldWarnings) {
                        if (first) {
                            console.log(delimiter)
                            console.log(wordwrap(`It's not possible to use the API to set field appearance in the Contentful editing interface, so you'll have to do it manually.`))
                            first = false;
                        }
                        console.info(`Content Type: ${chalk.cyan(data.name)}`);
                        data.contentfulFieldWarnings.forEach((message) => {
                            console.log(submsgPrefix, chalk.magenta(message));
                        })
                        console.log(submsgPrefix, contentfulFieldWarnings.contentTypeURL(data.id));
                    }
                })
                if(first === false) console.log(delimiter)
            })
        })
        .catch((err) => {
            throw err;
        })
    })
}

function run() {
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
            name: 'plural',
            message: 'Plural form of the Content Type name',
            default: (answers) => pluralize.plural(answers.name),
            validate: validate(required,validName),
            filter: (response) => capitalize.words(trim(response))
        },
        {
            type: 'input',
            name: 'description',
            message: 'Content Type Description (additional information about this Content Type)'
        },
        {
            type: 'confirm',
            name: 'shortTitleField',
            message: (answers) => `Include a 'Short Title' field for shorter titles when linking to a ${chalk.cyan(answers.name)} in a menu bar etc.`,
            default: false
        },
        {
            type: 'confirm',
            name: 'slugField',
            message: `Include a 'Slug' field? (recommended)`,
            default: true
        },
        {
            type: 'confirm',
            name: 'bodyField',
            message: `Include a 'Body' field for Markdown content?`,
            default: true
        },
        {
            type: 'confirm',
            name: 'pagination',
            message: 'Does this Content Type need a collection page (e.g. a single page that collects all Posts/Tags/People etc)?',
            default: false
        },
        {
            type: 'input',
            name: 'paginationPerPage',
            message: (answers) => `How many ${chalk.cyan(answers.plural)} should be on each collection page?`,
            default: 10,
            filter: parseInt,
            validate: validate(validInt),
            when: (answers) => answers.pagination
        },
        {
            type: 'input',
            name: 'collectionSortField',
            message: (answers) => `Which field should ${chalk.cyan(answers.plural)} be sorted by?`,
            default: 'title',
            validate: validate(required),
        },
        {
            type: 'list',
            name: 'collectionSortReverse',
            message: (answers) => `Direction to sort ${chalk.cyan(answers.plural)} by ${chalk.cyan(answers.collectionSortField)}?`,
            choices: [
                {
                    name: 'Ascending (A-Z / 0-9 / oldest-newest)',
                    value: false
                },
                {
                    name: 'Descending (Z-A / 9-0 / newest-oldest)',
                    value: true
                }
            ],
            default: 0,
        },
        {
            type: 'confirm',
            name: 'createPage',
            message: (answers) => `Should ${chalk.cyan(answers.plural)} have their own page in the final build? (E.g. should the system create a page at ${chalk.blue(`/${slug(answers.plural)}/${answers.slugField?'<slug>':'<id>'}/index.html`)}?)`,
            default: true,
            when: (answers) => !answers.pagination
        },
    ]

    return inquirer.prompt(questions)
    .then((answers) => generate(answers));

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
}


// export the generates() and run() functions so we can call them programmatically
if ( !(require.main === module) ){
    module.exports = {generate, run}
// otherwise run as a CLI
} else {
    run();
}


