/**
 * Description: Simple HTTP(S) Router
 * File : RouteServer.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */

/* Dependencies */
var url = require('url')
var qs = require('querystring')
var path = require('path')
var merge = require('./assets/merge')



/* middleware */
function RouterUtils(req, res, options){
	// request helpers
	req._url = req.url
	req.url = url.parse(req.url, true)
	req.url.pathname = qs.unescape(req.url.pathname)


	// reasponse helpers
	res.headers 	= options.headers || {}
	res.setHeader 	= function(header, value){
		res.headers[header] = value
	}
	res.setHeaders 	= function(headers){
		res.headers = merge(res.headers, headers)
	}
	res.sendHeaders	= function(status, extra){
		res.writeHead( status, merge(res.headers, extra || {}) )
	}


	res.data = ''

	res.send = function(){
		var args = Array.apply(null, arguments)
		args.forEach(function(p){
			res.data += p.toString()
		})
	}
	res.done = function served(head){
		res.writeHead(200, merge(res.headers, head || {}, {
			'content-length' : res.data.length,
		}))
		res.end(res.data)
	}

	res.redirect = function redirect(path){
		if ('string' !== typeof path) throw new TypeError('Path must be a [string]')
		var join = require('path').join
		path = ( (path[0] === '.')
				? join(req.parsed.pathname, path)
				: join('/', path)
			   ).replace(/\\/g, '/')

		var headers = merge(res.headers, {'Location' : path})
		res.writeHead(302, headers)
		res.end()
	}


}
RouterUtils.middleware = function(req, res, next){
	RouterUtils(req, res, {})
	return next()
}


module.exports = exports = RouterUtils

