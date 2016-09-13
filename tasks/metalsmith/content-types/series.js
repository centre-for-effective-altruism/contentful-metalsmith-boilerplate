// Schema for Series
module.exports = {
  name: {
    singular: 'Series',
    plural: 'Series'
  },
  slug: {
    singular: 'series',
    plural: 'series'
  },
  contentfulId: 'series',
  slugField: ':sys.id',
  collection: {
    sort: 'title',
    reverse: false
  },
  createPage: false
}
