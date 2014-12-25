/**
 * Description: Simple HTTP(S) Router
 * File : utils/request.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */


/* Dependencies */
var url		= require('url')
var qs		= require('querystring')
var path	= require('path')
var fs		= require('fs')

var mime	= require('mime')
var cookie	= require('cookie')
var util	= require('util')

var merge	= require('./merge')

function set(req, res, addin, options){
	// reasponse helpers


	/**
	 * HTTP Header API
	 * @methods
	 * > .set()
	 * @desc > wrapper for setting headers
	 * @param Object header > Object containing header value pairs
	 * @param String header > header name
	 * @param String value	> Header value
	 * 						> If not a String it will be converted
	 * @param extend		> Save version to extend an existing header
	 * @return Object res.headers
	 * > .get()
	 * @desc wrappr for accessing headers
	 * @param String header > header to be returned
	 * @return String header value
	 * TODO: Complete docs
	 */

	res.headers			= {}
	res.headers.set		= function (header, value, extend) {
		if ('object' === typeof header) {
			extend = value
			for (var h in header){
				this.set( h, header[h],	extend )
			}
		}
		else if (value !== undefined) {
			value = Array.isArray(value) ? value.map(String) : String(value)
			if ( extend === true){
				var cur = res.getHeader(header)
				value = (cur) ? [value].concat(cur) : value
			}

			res.setHeader(header, value)
			//this._headers[header] = value
		}
		else {
			throw new Error('headers.set needs either name and value pairs ' +
							'or a header object.')
		}

		return this
	}
	res.headers.get		= function(header){
		return res.getHeader(header)
		//return (header) ? this._headers[header] : this._headers
	}
	res.headers.del		= function(header){
		res.removeHeader(header)
		//this._headers[header] = delete this._headers[header]
		return this
	}
	res.headers.status	= function(status){
		res.statusCode = status || res.statusCode
		return res.statusCode
	}
	res.headers.cookie	= function(name, value, options){
		if (name){
			this.set('Set-Cookie', cookie.serialize(name, value, options), true)
		}
		return this
	}
	res.headers.send	= function (status, extra) {
		//res.writeHead(status, merge(res.headers._headers, extra || {}))
		this.status(status)
		this.set(extra || {})

		res.writeHead(status)
		return this
	}

	/**
	 * @desc framework saving
	 * @purpuse	> set own api only if there are no similar
	 * 			| ones set by a framework already
	 */
	res.set		= res.set 		|| res.headers.set
	res.get		= res.get		|| res.headers.get
	res.del		= res.del		|| res.headers.del
	res.status	= res.status	|| res.headers.status
	res.cookie	= res.cookie	|| res.headers.cookie



	/**
	 * @desc
	 * res.send() should be similar to express' .send()
	 * it takes one(!) argument of any kind
	 * - Buffers will be written directly
	 *	 changing the Content-Type header to 'bin'
	 * - Objects are written stringified
	 * - Numbers are converted to String
	 * - Strings are written directly
	 * @param any content	> Content to be written
	 * @param bool close	> If false Content can is served part by part
	 * 						> If true buffered Content if sent.
	 * 						> default: true
	 */
	res.serve = function(content, close){
		var headers = this.headers,
			close = (close === false) ? false : true,
			_buffer, length


		switch (typeof content){
			case 'object':
				if(Buffer.isBuffer(content)){
					headers.set('Content-Type', mime.lookup('bin'))
				}
				else if (content !== null){
					content = JSON.stringify(content)
					res.headers.set( 'Content-Type', mime.lookup('json') )
				}
				else { content = String( content ) }
				break;
		}

		/**
		 * conversion to Buffer
		 */
		if(!Buffer.isBuffer(content))
		{ content = new Buffer(String(content), options.encoding || 'utf-8') }


		/**
		 * if buffer exists extend it
		 * else set buffer
		 */
		if (this._response && Buffer.isBuffer(this._response)){
			this._response = Buffer.concat([this._response, content])
		} else {
			this._response = content
		}

		/**
		 * set Content-Type
		 * if Content-Type isn't set yet
		 */
		if(!headers.get('Content-Type')){
			headers.set('Content-Type', mime.lookup('.txt') )
		}

		/**
		 * set Content-Length
		 * encrease when some data is already written
		 */
		headers.set('Content-Length', this._response.length)

		/**
		 * send or write content
		 * depending on close param
		 */
		if (close)	{
			if(!res.headers.status()){ res.headers.status(200) }
			res.end(this._response, this._response.encoding)
		}
		return this
	}
	res.serve.file = function( P, done){
		P = P || req.route.options.file || null

		var _path	= {},
			err 	= {},
			msg 	= {}
		if(!P) {
			err = new TypeError('You have to define a Path to serve')
			err.id = 500

			msg = 'insufficient info'

			return {err : err, msg : msg}
		}

		_path.base	= options.basepath
		_path.path 	= P

		_path.ofFile = ( fs.existsSync(_path.path) )
		? _path.path
		: path.join(_path.base, _path.path)

		_path.ofFolder = path.dirname(_path.ofFile)

		/**
		 * return if file does not exist
		 */
		_path.exists = fs.existsSync(_path.ofFile)
		if (!_path.exists) {

			err = new Error('Not Found')
			err.id = 404

			msg.route = P


			return done(err, msg) || { err : err, msg : msg }
			/** TODO: directory serving
			 * ( options.serve_dir && fs.existsSync(_path.ofFolder) )
			 * ? this.serve.dir( _path.ofFolder, next )
			 * : next( err, msg ) || { err : err, msg : msg }
			 */

		}

		_path.stats = fs.statSync(_path.ofFile)
		if (!_path.stats.isFile()){

			err = new Error('Not a File')
			err.id = 404

			msg = { path : P }


			return done(err, msg) || {err : err, msg : msg}

		}

		_path.mime = mime.lookup(_path.ofFile)


		res.headers.set({
			'Content-Type'	: _path.mime,
			'Content-Length': _path.stats.size
		})
		res.headers.status(200)

		res.on('error', function (err) {

			err = new Error('File Not Found')
			err.id = 500

			msg = { path : P }


			return done(err, msg) || {err : err, msg : msg}

		})
		res.on('finish', function () {

			err = null

			msg = { path : P }


			return done(err, msg) || {err : err, msg : msg}
		})

		var stream = fs.createReadStream(_path.ofFile)
		stream.pipe(res)

		return
	}
	res.serve.template = function(input, done){
		var engine = addin.template
		if (!engine) {
			return done(new Error('NOENGINE'), '')
		}
		var local = merge(options.template || {},
						  engine.options || {},
						  req.route.options.template || {} )

		var output = {}

		// reference
		output.reference =
		input.ref 			|| input.reference
		|| local.reference	|| local.default_reference
		|| null
		// data
		output.data = merge(local.data || {} , input.data || {})
		// options
		output.options = merge( local, input.options || {})
		// callback
		output.done = done || input.done || local.done || defCB

		// call engine with context
		engine.handle.call(engine.context || {}, output)

		return res
		function defCB(err, content){
			if ( !err ){
				res.serve(content)
			}
		}
	}


	/**
	 * @desc			> Allows redirection by sending a 302 Status.
	 * @param String P 	> absolute or resolvable URI
	 * @return			> undefined
	 */
	res.redirect = function redirect(P) {
		if ('string' !== typeof P) throw new TypeError('Path must be a [string]')

		P = P[0] === '.'
		? path.resolve(req.parsed.pathname, P)
		: path.join('/', P).replace(/\\/g, '/')


		res.headers.set('Location', P)
		res.headers.status(302)
		res.serve('redirect...')
	}

	/**
	 * Apply headers defined in options
	 */

	res.headers.set(options.headers)

}

module.exports = exports = set
