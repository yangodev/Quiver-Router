/**
* Description: Simple HTTP(S) Router
* File : RouteServer.js
* Author: y4ng0 @ yangodev
* Licence: MIT
*/

/* Constructor / API */
var RouteServer = module.exports = exports = {}
RouteServer.create = setup

/* Dependencies */
var ArrowJS 		= require('ArrowJS')
var utils_request	= require('./utils/request.js')
var utils_response 	= require('./utils/response.js')

var merge 			= require('./utils/merge.js')
var mime			= require('mime')
var path			= require('path')
var fs				= require('fs')
var url				= require('url')



function setup(options, table) {
	options = merge({
		// default path of static files
		basepath: path.join(path.dirname(require.main.filename), 'public'),
		// template related options
		template: {
			// default path of template files
			viewpath: path.join(path.dirname(require.main.filename), 'views')
		},
		// default headers sent
		headers: {'X-Powered-By': 'Quiver by yangodev'},
		app : null
	}, options || {})

	/* 2. Level API */
	Server.match = _match
	Server.reverse = _reverse
	Server.static = _static

	Server.addons = {}
	Server.template = add_template_engine

	var _addin = Server.addin = {}



	/* Constructor/Middleware */
	return Server

	function Server(req, res, done) {
		var self = this

		utils_request(req, res, _addin, options)
		utils_response(req, res, _addin, options)

		var handler = ArrowJS.create()

		handler /* initializing */
		.context({
			served: false,
			msg: null,
			options: options
		})
		.finally( function (err, msg) {
			var out = {
				Error : err || null,
				Message : msg || this.msg || null,
				Route : match || null,
				Request : req.info,
				Response : {
					Status : '',
					StatusCode : res.headers.status() || null
				}
			}
			Object.freeze(out)


			if (err) {
				if (!options.app){
					var route = table.id('qvr.errors.' + String(err.id))
					/*--*/||	table.id('qvr.errors.500')
					res.redirect(route.reverse({route : req.uri.pathname}))
				}
				out.Response.Status = err.name
				return done(null, out)
			}
			else if (this.served) {
				out.Response.Status = 'Success'

				return done(null, out)
			}
			else {
				if(!options.app){
					var route = table.id('qvr.errors.404').reverse({route : req.uri.pathname})
					res.redirect(route)
				}
				out.Response.Status = out.Response.Ststus
				|| 'Not Found'
				out.Response.StatusCode = out.Response.StatusCode
				|| 404



				return done(null, out)
			}
		})

		var match = _match(req)
		if (match && match.type === 'static') {
			handler.use([].concat.apply(
				[/* flattening */],[
					_middlewareOf(match, false),
					_static(match)
				]) )
		}
		if (match && match.type === 'dynamic') {
			handler.use([].concat.apply(
				[/* flattening */],
				[ _middlewareOf(match)
				 ,function (req, res, next) {
					 this.served = true;
					 return next()
				 }
				]))
		}

		return handler(req, res)
	}

	/* Outsourcing */
	function _middlewareOf(route, strict) {
		var strict = (strict === false) ? false : true,
			middleware = []

		if (route.middleware) {
			middleware = [].concat.apply(
				[], [].concat(route.middleware).map(
					function (m) {
						if ('string' === typeof m) {
							var link = table.get({
								id: m
							}).concat(table.get({
								url: m
							}))
							var imported = []
							for (var i = 0; i < link.length; i++) {
								imported = imported.concat(
									_middlewareOf(link[i], false)
								)
							}
							return imported
						} else if ('function' === typeof m) {
							return m
						}
					}
				)
			)
		}
		if (strict) {
			var def = route.methods['DEFAULT'],
				requested = route.methods[route.method]

			if ('function' !== typeof requested) {
				if ('function' === typeof def) {
					middleware.push(def)
				} else {  return []  }
			} else {  middleware.push(requested)  }
			// is called once and only after the strict middleware has done its job w/o errors
		}

		return middleware
	}

	/* API */
	function _static(route) {
		return function (req, res, next) {
			var self = this
			var base = (typeof route !== 'string' && route.options)
			? route.options.path || '/'
			: '/'

			var p = (typeof route === 'string')
			? route
			: (route.params) ? route.params['$path'].join('/') || '/' : '/'

			res.serve.file(path.join(base, p), function(err, msg){
				if (!err) { self.served = true }
				return next(err, msg)
			})
		}
	}
	function _match(req /* or uri */ ) {
		/**
* Uses Array.prototype.reduce to find
* a matching route onthe table
*/
		if ('string' === typeof req) req = {
			url: url.parse(req)
		}

		var match = req.route = table.get().reduce(
			function (found, route, index, routes) {
				if ( found && found.type === 'static' )
				{ return route.match(req) || found }
				else if ( found ) { return found }
				else { return route.match(req) || found }
			},
			false)
		return match
	}
	function _reverse(id /* or uri */, options) {
		var route = table.one({id : id}) || table.one({url : id}) || undefined
		if (!route) throw new Error('Route > '
									+ id
									+ ' < can not be reverte as it does not exist!')



		return route.reverse(options)
	}

	function add_template_engine( definition ){

		// no arguments
		if( arguments.length < 1 ) return Server
		// reset addin
		if( null === definition ) {
			_addin.template = null
			return Server
		}

		if ('function' === typeof definition){
			_addin.template = {
				handle	: definition,
				context : null,
				options : {}
			}
		}
		if ('object' === definition){
			definition.context = definition.context || {}
			if (!definition.handle || 'function' !== typeof definition.handle){
				throw new TypeError('You have to serve a [function]'+
									' to handle templating.')
			}
			if ('object' !== typeof definition.context){
				throw new TypeError('Context must be an [object]!')
			}

			_addin.template = {
				handle : definition.handle,
				context : definition.context,
				options : definition.options
			}

		}

		return Server
	}

}
