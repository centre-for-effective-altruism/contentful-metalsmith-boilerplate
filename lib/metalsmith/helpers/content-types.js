// generate information about each content type for use with various metalsmith plugins

const paths = require('../../helpers/file-paths')
const path = require('path')
const yaml = require('js-yaml')

const contentTypes = require(path.join(paths.tasks, 'metalsmith', 'content-types'))

function contentfulFactory (contentType) {
  const contentfulFile = {
    title: contentType.name.plural,
    contentful: {
      content_type: contentType.contentfulId,
      entry_template: `${contentType.slug.singular}.pug`,
      entry_filename_pattern: `${contentType.slug.plural}/:fields.slug`,
      permalink_style: true
    }
  }
  const delimiter = `---`
  return [delimiter, yaml.safeDump(contentfulFile), delimiter].join('\n')
}

function collectionFactory (contentType) {
  contentType.collection = contentType.collection || {}
  return {
    pattern: `${contentType.slug.plural}/**/index.html`,
    sortBy: contentType.collection.sort || 'title',
    reverse: contentType.collection.reverse || false,
    metadata: {
      slug: contentType.slug,
      name: contentType.name
    }
  }
}

function paginationFactory (contentType) {
  return {
    perPage: contentType.pagination.perPage || 10,
    template: 'collection.pug',
    first: `${contentType.slug.plural}/index.html`,
    path: 'talks/:num/index.html',
    pageMetadata: {
      title: contentType.name.plural,
      slug: contentType.slug.plural,
      contentType: contentType.slug.singular,
      collectionSlug: 'collection'
    }
  }
}

module.exports = function () {
  const schemas = {
    contentful: {},
    collections: {},
    pagination: {}
  }
  Object.keys(contentTypes).forEach((contentTypeId) => {
    const contentType = contentTypes[contentTypeId]
    schemas.contentful[contentType.contentfulId] = contentfulFactory(contentType)
    schemas.collections[contentType.slug.plural] = collectionFactory(contentType)
    if (contentType.pagination) {
      schemas.pagination[`collections.${contentType.slug.plural}`] = paginationFactory(contentType)
    }
  })
  return schemas
}
