/**
 * Description: Simple HTTP(S) Router
 * File : Router.js
 * Author: y4ng0 @ yangodev
 * Licence: MIT
 */

/* Constructor*/
var Router = module.exports = exports = {}

/* Helpers */
var merge = require('./assets/merge'),
	isArray = Array.isArray

/* Dependencies */
var RouteTable = require('./RouteTable.js')
var RouteServer = require('./RouteServer.js')



/* Prototype */
Router.create = function createRouter(options) {
	var options = merge({}, options)
	var table = RouteTable.create()

	/* Out */
	var server = RouteServer.create(options, table)

	/** Methodes */
	server.table = function () {
		return table.get()
	}
	server.table.filter = table.get
	server.route = table.route
	server.parse = table.parse

	/* defaults */
	server.parse(require('./assets/routes.default.js'))

	if (options.default) {
		server.parse(options.defaults)
	}

	/* middleware attributes */
	if (options.app) {
		options.app.route = table.route
		options.app.parse = table.parse
	}
	if (options.events) {	}

	return server
}
