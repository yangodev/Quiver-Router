/**
 * Description: Simple HTTP(S) Router
 * File : RouterUtils.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */

/* Dependencies */
var url		= require('url')
var qs		= require('querystring')
var path	= require('path')
var isArray = Array.isArray


function merge(obj1, obj2 /*further objects*/ ) {
	var result = {}
	if (!obj2) obj2 = {}


	if ('object' !== typeof obj2 || 'object' !== typeof obj1) {
		throw new TypeError('You can only merge Objects')
	}
	if (Array.isArray(obj1) && Array.isArray(obj2)){
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
function RouterUtils(req, res, options) {
	// request helpers
	req._url = req.url
	req.url = url.parse(req.url, true)
	req.url.pathname = qs.unescape(req.url.pathname)


	// reasponse helpers
	res.headers = options.headers || {}
	res.setHeader = function (header, value) {
		res.headers[header] = value
	}
	res.setHeaders = function (headers) {
		res.headers = merge(res.headers, headers)
	}
	res.sendHeaders = function (status, extra) {
		res.writeHead(status, merge(res.headers, extra || {}))
	}


	res.data = ''

	res.send = function () {
		var args = Array.apply(null, arguments)
		args.forEach(function (p) {
			res.data += p.toString()
		})
	}
	res.done = function served(head) {
		res.writeHead(200, merge(res.headers, head || {}, {
			'content-length': res.data.length,
		}))
		res.end(res.data)
	}

	res.redirect = function redirect(path) {
		if ('string' !== typeof path) throw new TypeError('Path must be a [string]')
		var join = require('path').join
		path = ((path[0] === '.') ? join(req.parsed.pathname, path) : join('/', path)).replace(/\\/g, '/')

		var headers = merge(res.headers, {
			'Location': path
		})
		res.writeHead(302, headers)
		res.end()
	}


}
RouterUtils.middleware = function (req, res, next) {
	RouterUtils(req, res, {})
	return next()
}


var out = module.exports = exports = {}
out.RouterUtils = RouterUtils
out.merge = merge
