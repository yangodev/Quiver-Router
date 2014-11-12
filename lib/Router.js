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

	/** API / Methodes */
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

	/**
	 * Set methods .route() and .parse() to middleware framework
	 * to make access easier
	 */
	if (options.app) {
		options.app.route = server.route
		options.app.parse = server.parse
	}
	/**
	 * Set s custom EventEmitter as handling emitter
	 * if not defined E3 will be used
	 */
	if (options.events) {  /* TODO: EventEmitter */  }

	return server
}
