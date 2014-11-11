function merge(obj1, obj2 /*further objects*/ ) {
	var result = {}
	if (!obj2) obj2 = {}


	if ('object' !== typeof obj2 || 'object' !== typeof obj1) {
		throw new TypeError('You can only merge Objects')
	}
	if (Array.isArray(obj1) && Array.isArray(obj2)) return [].concat(obj1, obj2)

	for (var key in obj1)
		if (obj1.hasOwnProperty(key)) {
			result[key] = obj1[key]
		}
	if (arguments.length > 1) {
		[].slice.call(arguments)
		.splice(1)
		.forEach(function (obj) {

			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if ('object' !== typeof result[key] || !Array.isArray(result[key]) && Array.isArray(obj[key])) {
						result[key] = obj[key]
					} else {
						result[key] = (Array.isArray(result[key]))
						? [].concat(result[key], obj[key]) : merge(result[key], obj[key])

					}
				}
			}

		})
	}
	return result
}



module.exports = exports = merge
