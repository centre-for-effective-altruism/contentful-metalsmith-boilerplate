// Schema for Posts
module.exports = {
  name: {
    singular: 'Post',
    plural: 'Posts'
  },
  slug: {
    singular: 'post',
    plural: 'posts'
  },
  contentfulId: 'post',
  slugField: ':sys.id',
  collection: {
    sort: 'date',
    reverse: true
  },
  createPage: true,
  pagination: {
    perPage: 10
  }
}
