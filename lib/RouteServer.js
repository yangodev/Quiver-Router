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
var merge = require('./assets/merge')
var mime = require('mime')

var path = require('path')
var fs = require('fs')
var url = require('url')

var RouterUtils = require('./RouterUtils')


/* Dependencies */
var ArrowJS = require('ArrowJS')


function setup(options, table) {
	options = merge({
		basepath: path.join(path.dirname(require.main.filename), 'public')
	}, options || {})


	Server.match = _match
	Server.utils = RouterUtils.middleware
	Server.static = _static


	/* Constructor/Middleware */
	return Server


	/** middleware module */
	function Server(req, res, done) {
		var self = this


		RouterUtils(req, res, options)


		var handler = ArrowJS.create()
		handler.context({
			served: false,
			msg: null,
			options: options
		})
		.finally(function (err, msg) {
			if (err) {
				res.redirect(path.join('/errors/500', req.url.pathname))
				return done(null, {
					Message		: 'internal error',
					Error		: err,
					Route		: match,
					Additional	: msg || this.msg || '',
					Action		: 'Redirected to /errors/500'
				})
			}
			if (this.served) {
				return done(null,{
					Message : 'successfully served',
					Additional: msg || this.msg || ''
				})
			} else {
				res.redirect(path.join('/errors/404', req.url.pathname))
				return done(null, {
					Error : 'Not Found',
					url : req.url.pathname,
					Additional : msg || this.msg || '',
					Action : 'Redirect to /errors/404'
				})
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
				[/* flattening */], [
					_middlewareOf(match),
					function (req, res, next) {
						this.served = true;
						return next()
					}
				]))
		}



		return handler(req, res)



	}


	/* Functionality */
	function _static(route) {
		return function (req, res, next) {
			var self = this
			var _path = {}
			_path.base = options.basepath
			_path.req = req.url.pathname

			_path.ofFile = (fs.existsSync(route.options.path)) ? path.join(route.options.path, route.params['$path'].join('/')) : path.join(_path.base, route.options.path || '', route.params['$path'].join('/'))

			_path.ofFolder = path.dirname(_path.ofFile)
			_path.exists = fs.existsSync(_path.ofFile)
			_path.mime = mime.lookup(_path.ofFile)

			fs.exists(_path.ofFile, function (exists) {
				if (!exists) return next(null, 'File not found')

				_path.stats = fs.statSync(_path.ofFile)

				if (!_path.stats.isFile()) return next(null, 'Not a File')


				res.setHeader('content-type', _path.mime)
				res.setHeader('content-length', _path.stats.size)
				res.sendHeaders(200)

				var stream = fs.createReadStream(_path.ofFile)
				stream.pipe(res)
				res.on('error', function (err) {
					self.error = err
					next(err)

				})


				res.on('finish', function () {
					self.served = true
					next()
				})
			})
		}
	}
	function _match(req /* or uri */ ) {
		if ('string' === typeof req) req = {
			url: url.parse(req)
		}

		var match = req.route = table.get().reduce(
			function (found, route, index, routes) {
				if ( found ) { return found }
				else { return ( route.match(req) ) ? route : found }
			},
			false)
		return match
	}
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
								imported = imported.concat(_middlewareOf(link[i], false))
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
}




/**
* TODO: options.defaults
* TODO hadError()


*/
