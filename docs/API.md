# API
This file contains explanation for ...-Routers API

## Global
### Router
* `Router.table()` Returns the route table all routes are stored in.
	* `Router.table.filter(filter)` Returns the part of the route table which has the values defined by the filter.
	* `Router.table.one(filter)` Returns one Route that has the values of the filter.
	* `Router.table.id(id)` Returns the route which matches the given id.
* `Router.route(route, [route2,.., routeN])` used to add routes (see [Route Documentation](./routedef.md)).
* `Router.parse()`
	* Takes either a function that is called with `Router` as parameter.
	* It also takes a
