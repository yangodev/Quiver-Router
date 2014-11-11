/**
 * Description: Simple HTTP(S) Router
 * File : RouteDefinition.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */


/* Utils */
var merge = require('./assets/merge'),
	path = require('path'),
	fs = require('fs')
/*
var _ = require('lodash')
,	merge = _({}).extend
*/

/* defaults */
var DefaultDefinition = {
	url: '/',
	methods: {},
	middleware: [],
	type: 'dynamic',
	options: {}
}


/* functionality */
var createDefinition = function create(route) {
	var wrapper = {}


	var definition = merge(DefaultDefinition, route)
	var routeAPI = {
		merge: _extend,
		match: _match
	}

	route = merge(wrapper, definition, routeAPI)
	setMethods()
	setMiddleware()
	if (route.type === 'static') {
		onStatic()
	}

	return route

	// polishing
	function setMethods() {
		// * uppercase routes
		Object.keys(route.methods)
		.forEach(function (method) {
			// * UpperCase the all methods given and store value
			var key = method.toUpperCase(),
				val = route.methods[method]


			// * Delete old property

			delete route.methods[method]
			// * Set new val
			route.methods[key] = val
		})
	}

	function setMiddleware() {
		// * removes everything thats not a function
		route.middleware.filter(function (m) {
			return ('function' === typeof m || 'string' === typeof m)
		})
	}

	function onStatic() {
		if (!/(\/.{3}\$path\/?|\/\$path.{3}\/?)/i.test(route.url)) {
			route.url = path.join(route.url, '...$path').replace(/\\/g, '/')
		}

	}


	// * secnd class methods
	function _extend(newone) {
		var self = this
		return create(merge(self, newone))
	}

	function _match(req) {
		var self = this

		self.query 	= req.url.query
		self.hash	= req.url.hash
		self.auth	= req.url.auth
		self.method	= req.method

		/** resolves String as follws
	 * [0] - parsed string
	 * [1] - param identifier: prefixed '...'	--> on '/...params'
	 * [2] - param descriptor: suffixed [String] -> on '/...params'
	 * [3] - param descriptor: prefixed [String] -> on '/params...'
	 * [4] - param identifier: suffixed '...'	--> on '/params...'
	 * [5] - param identifier: prefixed '@' char -> on /'@param'
	 * [6] - param descriptor: suffixed [String] -> on '/@param'
	 * [7] - param-less: route name 			--> on /route
	 ---------------------------------------------------------------*/
		var re_param = /(\.{3})(\S+)|(\S+)(\.{3})|(@)(\S+)|(\S+)/i
		/* returns everything thats not /  */
		var re_urlpath = /[^\/]+/g


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
			path: req.url.pathname,

			fragments: req.url.pathname
			.toLocaleLowerCase()
			.match(re_urlpath) || [],

			fragmentindex: 0,
			fragment: undefined
		}


		return (nextFragment()) ? self : false

		function nextFragment() {
			_req.fragment = _req.fragments[_req.fragmentindex]
			_cur.fragment = _cur.fragments[_cur.fragmentindex]
			_cur.param = re_param.exec(_cur.fragment) || null

			/** if _request path is longer 		/
			 * than the defined route path	*/
			if (!_cur.fragment && _req.fragment) return false
			else if (!_cur.fragment && !_req.fragment) {
				self.params = _cur.paramcoll
				return true
			} // here it is finished


			/* param-less fragments */
			if (_cur.param[7] && _cur.param[7] !== 'undefined') {
				if (_cur.param[7] === _req.fragment) {
					/* prepare for next fragment */
					_cur.fragmentindex++
					_req.fragmentindex++
					return nextFragment()
				} else if (_cur.param[7] === '...') {
					var wildcardContent = [],
						lookup_end_value = _cur.fragments[_cur.fragmentindex + 1],
						current_index = _req.fragmentindex,
						lookup_padding = 0,
						lookup = function () {
							return _req.fragments[current_index + lookup_padding]
						}

					while (lookup() !== lookup_end_value && (current_index + lookup_padding) <= _req.path.length) {
						/* add value to paramContent */
						wildcardContent[wildcardContent.length] = lookup()
						lookup_padding++
					}


					_cur.fragmentindex++
					_req.fragmentindex += lookup_padding
					_cur.paramcoll['wildcard'] = [].concat(
						wildcardContent, (_cur.paramcoll.wildcard) ? _cur.paramcoll.wildcard : [])
					return nextFragment()
				} else {
					return false
				}
			}
			/* '@'-param fragments */
			else if (_cur.param[5] && _cur.param[5] !== 'undefined') {
				var paramID = _cur.param[6],
					paramContent = _req.fragment

				_cur.paramcoll[paramID] = paramContent

				/* prepare for next fragment */
				_cur.fragmentindex++
				_req.fragmentindex++
				return nextFragment()
			}
			/* '...xy / xy...'-param fragments */
			else if (_cur.param[2] && _cur.param[2] !== 'undefined' || _cur.param[3] && _cur.param[3] !== 'undefined') {
				var paramContent = [],
					paramID = _cur.param[2] || _cur.param[3],
					lookup_end_value = _cur.fragments[_cur.fragmentindex + 1],
					current_index = _req.fragmentindex,
					lookup_padding = 0,
					lookup = function () {
						return _req.fragments[current_index + lookup_padding]
					}

				while (lookup() !== lookup_end_value && (current_index + lookup_padding) <= _req.path.length) {
					/* add value to paramContent */
					paramContent[paramContent.length] = lookup()
					lookup_padding++
				}

				_req.fragmentindex += lookup_padding
				_cur.fragmentindex++
				_cur.paramcoll[paramID] = paramContent

				return nextFragment()
			}

			/* jump out */
			return false
		}
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


module.exports = exports = api
