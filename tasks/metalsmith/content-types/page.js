// Schema for Pages
module.exports = {
  name: {
    singular: 'Page',
    plural: 'Pages'
  },
  slug: {
    singular: 'page',
    plural: 'pages'
  },
  contentfulId: 'page',
  contentfulFilenameField: 'fields.slug',
  collection: {
    sort: 'title',
    reverse: false
  },
  createPage: true
}
