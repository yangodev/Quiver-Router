/**
 * Description: Simple HTTP(S) Router
 * File : utils/request.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */


/* Dependencies */
var url		= require('url')
var qs		= require('querystring')
var cookie	= require('cookie')
var path	= require('path')
var merge	= require('./merge')

function set(req, res, addin, options){
	// request helpers

	req.uri = url.parse(req.url, true)
	req.uri.pathname = qs.unescape(req.uri.pathname)
	req.uri.host = req.headers.host
	req.uri.hostname = req.uri.host.split(':')[0]

	req.cookies = cookie.parse( req.headers['cookie'] || '' )

	req.info = merge({
		httpVersion : req.httpVersion,
		headers : req.headers,
		cookies : req.cookies,
		method : req.method,
		url	: req.url
	}, req.uri)
	Object.freeze(req.info)

}


module.exports = exports = set
