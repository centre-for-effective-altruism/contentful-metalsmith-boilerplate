module.exports = {
    "name": "Post",
    "contentType": "post",
    "slugField": ":sys.id",
    "plural": "Posts",
    "collection": {
        "sort": "date",
        "reverse": true
    },
    "createPage": true,
    "pagination": {
        "perPage": 10
    }
}