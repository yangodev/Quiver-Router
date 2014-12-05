/**
 * Description: Simple HTTP(S) Router
 * File : RouteTable.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */

var RouteTable = module.exports = exports = {}

/* Dependencies */
var RouteDefinition = require('./RouteDefinition.js')

RouteTable.create = setup

function setup() {
	var table = []
	var api = {
		get		: get,
		one		: one,
		id		: id,
		route	: add,
		parse	: parse
	}
	//return table
	return api

	function get(filter /*, more filters */ ) {
		if (filter === undefined) return table
		if (typeof filter !== 'object') {
			throw new TypeError('Filter must be an[object]')
		}



		var result = table

		for (var key in filter) {
			result = result.filter(function (route) {
				return matchFilter(filter, route, key)
			})
		}
		return result


		/* functions */

		function matchFilter(f, r, k) {
			if (!f.hasOwnProperty(k) || !r.hasOwnProperty(k)) {
				return false
			}

			if ('object' === typeof f[k] && 'object' === typeof r[k]) {
				var matched = true
				for (var key in f[k]) {
					if (matched === false) break;
					matched = matchFilter(f[k], r[k], key)
				}
				return matched
			}

			return f[k] === r[k]
		}

	}
	function one(filter){ return get(filter)[0] }
	function id(id) {
		return api.get({
			id: id
		})[0] || null
	}
	function add( /* RouteDefinitions */ ) {
		var self = this
		var args = [].slice.call(arguments)

		args.forEach(function (route) {
			var merged = false
			table = table.map(function (r) {

				if (route['id']) {
					if (r['id'] === route['id']) {
						return r.merge(route)
						merged = true
					}
				} else if (route['url']) {
					if (r['url'] === route['url']) {
						return r.merge(route)
						merged = true
					}
				}

				return r
			})
			if (!merged) table.push(RouteDefinition.create(route))
				})

		return this
	}
	function parse( /* FILES */ ) {
		var self = this
		var input = [].slice.call(arguments)
		input.forEach(function (i) {
			switch (typeof i) {
				case 'object':
					table.route(i)
					break;
				case 'function':
					i(self)
					break;
				case 'string':
					try {
						parse.call(self, require(i))
					} catch (e) {}
			}
		})
		return self
	}
}
