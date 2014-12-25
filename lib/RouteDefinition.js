/**
* Description: RouteDefinition for Wegweiser.js
* File : RouteDefinition.js
* Author: y4ng0 @ yangodev
* Licence: MIT
*/


/* Utils */
var merge = require('./utils/merge.js'),
	qs = require('querystring'),
	path = require('path'),
	url = require('url'),
	fs = require('fs')


/* defaults */
var DefaultDefinition = {
	url: '/',
	methods: {},
	middleware: [],
	type: 'dynamic',
	options: {}
}

/* regular expressions */

/**
* resolves String as follws
* [0] - parsed string
* [1] - param identifier: ... or @
* [2] - param args: ? for optional
* [3] - param name
* [4] - path if no param present
*/
var re_param = /(\.{3}|@)([\?])?(\S*)|(\S*)?/i
/* returns everything thats not /  */
var re_urlpath = /[^\/]+/g


/* functionality */
var createDefinition = function create(route) {
	var wrapper = {}


	var definition = merge(DefaultDefinition, route)
	var routeAPI = {
		merge		: _extend,
		match		: _match,
		reverse		: _reverse
	}

	route = merge(wrapper, definition, routeAPI)
	setMethods()
	setMiddleware()
	if (route.type === 'static') {
		onStatic()
	}

	return route

	/**
	* Uppercasing of given methods
	*/
	function setMethods() {
		// * uppercase routes
		Object.keys(route.methods)
		.forEach(function(method) {
			// * UpperCase the all methods given and store value
			var key = method.toUpperCase(),
				val = route.methods[method]

			// * Delete old property

			delete    route.methods[method]
			// * Set new val
			route.methods[key] = val
		})
	}
	/**
	* sorts out the trash
	*/
	function setMiddleware() {
		// * removes everything thats not a function
		route.middleware.filter(function(m) {
			return ('function' === typeof m || 'string' === typeof m)
		})
	}
	/**
	* Tweaks for statci routes
	*/
	function onStatic() {
		if (!/\.{3}\$path(\/|$)/i.test(route.url)) {
			route.url = path.join(route.url, '...$path').replace(/\\/g, '/')
		}
	}

	/**
	* extends current route
	*/
	function _extend(newone) {
		var self = this
		return create(merge(self, newone))
	}

	/**
	* returns itself if given route matches own definition
	* returns false if not
	*/
	function _match(req) {
		var self = this
		var out = merge({}, self)

		out.request = req.info
		out.params = out.request.params = req.params = {}
		out.query = out.request.query
		out.headers = out.request.headers
		out.hash = out.request.hash

		var _cur = {
			path: self.url,

			fragments: self.url
			.toLocaleLowerCase()
			.match(re_urlpath) || [],

			fragmentindex: 0,
			fragment: undefined,

			param: undefined,
			paramcoll: {},
			params: null // output
		}


		var _req = {
			path: req.uri.pathname,

			fragments: req.uri.pathname
			.toLocaleLowerCase()
			.match(re_urlpath) || [],

			fragmentindex: 0,
			fragment: undefined
		}


		return (nextFragment()) ? out : false

		function nextFragment() {
			_req.fragment = _req.fragments[_req.fragmentindex]
			_cur.fragment = _cur.fragments[_cur.fragmentindex]
			_cur.param = re_param.exec(_cur.fragment) || null

			/** return if _request path is longer
			* than the defined route path.
			* If _request and route path end at same level
			* return true  --> route matches
			*/
			if (!_cur.fragment && _req.fragment) return false
			else if (!_cur.fragment && !_req.fragment) {
				out.params = req.params = _cur.paramcoll
				return true
			}

			/* param-less fragments */
			if (_cur.param[4] && _cur.param[4] === _req.fragment) {
				/* prepare for next fragment */
				_cur.fragmentindex++
				_req.fragmentindex++
				return nextFragment()
			} else return false

			/**
					* first look if a multiparam route (...foo) is present
					* if not loo if a normal param route (@bar) is present
					*/
			var paramID = (_cur.param[3] === undefined) ? 'wildcard' : _cur.param[3]

			if (_cur.param[1] === '...') {
				var paramContent = [],
					lookup_end_value = _cur.fragments[_cur.fragmentindex + 1],
					current_index = _req.fragmentindex,
					lookup_padding = 0,
					lookup = function() {
						return _req.fragments[current_index + lookup_padding]
					}

				while (lookup() !== lookup_end_value && (current_index + lookup_padding) <= _req.path.length) {

					/* add value to paramContent */
					paramContent[paramContent.length] = lookup()
					lookup_padding++
				}

				_req.fragmentindex += lookup_padding
				_cur.fragmentindex++

				_cur.paramcoll[paramID] = _cur.paramcoll[paramID] ? [].concat(_cur.paramcoll[paramID], paramContent) : paramContent

				return nextFragment()
			}
			if (_cur.param[1] === '@') {
				var paramContent = _req.fragment
				_cur.paramcoll[paramID] = _cur.paramcoll[paramID] ? [].concat(_cur.paramcoll[paramID], paramContent) : paramContent

				/* prepare for next fragment */
				_cur.fragmentindex++
				_req.fragmentindex++
				return nextFragment()
			}

			// if no match found
			return false
		}
	}

	/**
			* takes its own route definition and creates a
			* route (uri) string from it
			*/
	function _reverse(data) {
		var self = this,
			data = data || {},
			missing = [],
			err = null,
			def = self.url.match(re_urlpath)


		var url = def
		.map(function(fragment) {
			return re_param.exec(fragment)
		})
		.map(function(fragment) {
			/** non-param */
			if (fragment[4]) {
				return fragment[4]
			}

			/** params */
			var paramcontent = (fragment[3]) ? data[fragment[3]] : data['wildcard']
			if (!paramcontent) {
				missing.push(fragment[3] || 'wildcard');
				return null
			}

			if (fragment[1] === '...') {
				return qs.escape(paramcontent)
			}
			if (fragment[1] === '@') {
				return qs.escape(paramcontent)
			}

		})
		.reduce(function(complete, part) {
			return complete.concat(part)
		}, [''])
		.join('/')

		if (missing.length > 0) {
			err = new Error('Data missing for param:' + missing.join('\n *'))
			err.missing = missing
		}

		return (err) ? err : url
	}
}

/* API */
var api = {}
Object.defineProperty(api, 'create', {
	value: createDefinition,
	writable: false,
	configurable: false,
	enumerable: true
})
Object.defineProperty(api, 'DefaultDefinition', {
	value: DefaultDefinition,
	writable: false,
	configurable: false,
	enumerable: true
})

// Expose API
module.exports = exports = api
