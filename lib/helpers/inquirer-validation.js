var Promise = require('bluebird')

module.exports = {
  validate: (...args) => {
    var validations = [...args]
    return (response) => {
      const promises = validations.map((validation) => validation(response))
      return Promise.all(promises)
        .then(() => true)
        .catch((err) => err.message || err)
    }
  },
  required: (response) => {
    return typeof response === 'string' && response.length ? Promise.resolve(true) : Promise.reject(Error(`Required field`))
  }
}
