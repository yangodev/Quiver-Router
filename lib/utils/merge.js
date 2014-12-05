/**
 * Description: Simple HTTP(S) Router
 * File : utils/merge.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */


var isArray = Array.isArray

/**
 * @param one or more objects and merges them together
 * @return merged object
 * nested objects are merged recursively
 * nested arrays a concatenated
 * all other types are overridden if they have same keys
*/
function merge(obj1, obj2) {
	var result = {}
	if (!obj2) obj2 = {}


	if ('object' !== typeof obj2 || 'object' !== typeof obj1) {
		throw new TypeError('You can only merge Objects')
	}
	if (isArray(obj1) && isArray(obj2)){
		return [].concat(result, obj2)
	}


	for (var key in obj1){
		if (obj1.hasOwnProperty(key)) {
			result[key] = obj1[key]
		}
	}


	if (arguments.length > 1) {
		[].slice.call(arguments)
		.splice(1)
		.forEach(function (obj) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if( isArray(result[key]) && isArray(obj[key]) ) {
						result[key] = []
						.concat(
							result[key],
							obj[key]
						)
					}
					else if (
						'object' === typeof result[key]
						&& 'object' === typeof obj[key] )
					{	result[key] = merge(result[key], obj[key]) }
					else {
						result[key] = obj[key]
					}
				}
			}
		})
	}
	return result
}


module.exports = exports = merge
