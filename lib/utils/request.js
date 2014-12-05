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
	req.uri.pathname = qs.unescape(req.url.pathname)

	req.cookies = cookie.parse( req.headers['cookie'] || '' )
}



module.exports = exports = set
