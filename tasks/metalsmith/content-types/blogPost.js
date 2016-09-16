// Schema for Blog Posts
module.exports = {
  name: {
    singular: 'Blog Post',
    plural: 'Blog Posts'
  },
  slug: {
    singular: 'blog-post',
    plural: 'blog-posts'
  },
  contentfulId: 'blogPost',
  contentfulFilenameField: 'fields.slug',
  collection: {
    sort: 'date',
    reverse: true
  },
  createPage: true,
  pagination: {
    perPage: 10
  }
}
