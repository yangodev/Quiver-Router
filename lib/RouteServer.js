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


function setup(options, table){
	options = merge({}, options || {})

	/* Constructor/Middleware */
	return Server


	/** Methodes */
	function Server(req, res, done){
		var self = this

		Server.utils = RouterUtils.middleware


		RouterUtils(req, res, options)
		var match = req.route = table.get().reduce(
			function(found, route, index, routes){
				if (found) return found
				if (!found){ return ( route.match(req) ) ? route : false }
			},
			false)

		var handler = ArrowJS.create()
		handler.context({
			served : false,
			msg : null,
			options : options
		})
		.finally(function(err, msg){
			if (err) {
				res.redirect(path.join('/errors/500', req.url.pathname))
				return done(null,
							'Message: internal error\n'
							+ 'Error: ' + err
							+ 'Additional: ' + (msg || this.msg || '----')
							+ 'Action: ' + 'Redirect to /errors/500'
						   )
			}
			if (this.served) {
				return done(null,
							'Message: successfully served\n'
							+ 'Additional: '
							+ (msg || this.msg || '-----')
						   )
			} else {
				res.redirect(path.join('/errors/404', req.url.pathname))
				return done(null,
							'Error: Route ' + req.url.pathname + ' not Found\n'
							+ 'Additional: ' + (msg || this.msg || '----')
							+ 'Action: Redirect to /errors/404'
						   )
			}
		})

		if (match){
			if (match.type === 'static'){
				handler.use([].concat(middlewareOf(match, false),
									  srvstatic(match)			))
			}else{
				handler.use([].concat(middlewareOf(match)						,
									  function(req, res, next)
									  { this.served = true ; return next() }	))
			}
		}


		return handler(req, res)
		function srvstatic(route){

			return function(req, res, next){
				var self = this
				var _path = {}
				_path.base 		= options.basepath
				_path.req 		= req.url.pathname

				_path.ofFile 	= (fs.existsSync(route.options.path))
				? path.join(route.options.path, route.params['$path'].join('/'))
				: path.join(_path.base, route.options.path || '', route.params['$path'].join('/'))

				_path.ofFolder	= path.dirname(_path.ofFile)
				_path.exists	= fs.existsSync(_path.ofFile)
				_path.mime		= mime.lookup(_path.ofFile)

				fs.exists(_path.ofFile, function(exists){
					if (!exists) return next(null,'File not found')

					_path.stats = fs.statSync(_path.ofFile)

					if (!_path.stats.isFile()) return next(null, 'Not a File')


					res.setHeader('content-type' , _path.mime)
					res.setHeader('content-length', _path.stats.size)
					res.sendHeaders(200)

					var stream = fs.createReadStream(_path.ofFile)
					stream.pipe(res)
					res.on('error', function(err){
						self.error = err
						next(err)

					})


					res.on('finish', function(){
						self.served = true
						next()
					})
				})
			}

		}
		function middlewareOf(route, strict){
			var strict = (strict === false) ? false : true
			,	middleware = []

			if (route.middleware){
				middleware = [].concat.apply([],[].concat(route.middleware).map(
					function(m){
						if ('string' === typeof m){
							var link = table.get({id : m}).concat(table.get({url : m}))
							var imported = []
							for (var i = 0; i < link.length ; i++){
								imported = imported.concat( middlewareOf(link[i], false) )
							}
							return imported
						} else if ('function' === typeof m) { return m }
					})
											)
			}
			if (strict) {
				var def = route.methods['DEFAULT']
				,	requested = route.methods[req.method]

				if ('function' !== typeof requested){
					if ( 'function' === typeof def ) { middleware.push(def) }
					else { return [] }
				} else { middleware.push( requested ) }

				middleware.push(function(rea, req, next){
					this.served = true
					return next()
				})
				// is called once and only after the strict middleware has done its job w/o errors
			}

			return middleware
		}
	}
}




/**
* TODO: options.defaults
* TODO hadError()


*/
