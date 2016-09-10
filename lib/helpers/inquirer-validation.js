var Promise = require('bluebird');

function wrapValidation (validation) {
	return new Promise(function(resolve, reject) {
		return validation === true ? resolve(true) : reject(new Error(validation));
	});
}

module.exports = {
	validate: function (...args) {
		var validations = [...args];
		return function(response){
			const promises = validations.map((validation) => wrapValidation(validation(response)));
			return Promise.all(promises)
			.then(() => true)
			.catch((err) => err.message);
		}
	},
	required: function (response){
		return typeof response === 'string' && response.length ? true : `Required field`;
	}
}