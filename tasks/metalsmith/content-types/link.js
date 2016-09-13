// Schema for Links
module.exports = {
  name: {
    singular: 'Link',
    plural: 'Links'
  },
  slug: {
    singular: 'link',
    plural: 'links'
  },
  contentfulId: 'link',
  slugField: ':sys.id',
  collection: {
    sort: 'title',
    reverse: false
  },
  createPage: false
}
