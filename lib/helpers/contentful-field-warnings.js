require('dotenv').load()
const chalk = require('chalk')
module.exports = {
  appearance: function (field, appearance) {
    return `You should change the 'Appearance' setting for the ${chalk.cyan(field)} field to ${chalk.blue(appearance)}`
  },
  contentTypeURL: function (contentTypeID) {
    return `Edit the Content Type at ${chalk.underline(`https://app.contentful.com/spaces/${process.env.CONTENTFUL_SPACE}/content_types/${contentTypeID}`)}`
  }
}
