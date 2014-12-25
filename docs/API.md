# API
This file contains explanation for ...-Routers API

## Global
* `Wegweiser.create([options])` creates a new Wegweiser.js instance with given options
	* more information about options [here](./API.js#Options)
### Router
* `Router.table()` Returns the route table all routes are stored in.
	* `Router.table.filter(filter)` Returns the part of the route table which has the values defined by the filter.
	* `Router.table.one(filter)` Returns one Route that has the values of the filter.
	* `Router.table.id(id)` Returns the route which matches the given id.
* `Router.route(route, [route2,.., routeN])` used to add routes (see [Route Documentation](./routedef.md)).
* `Router.parse()`
	* Takes either a function that is called with `Router` as parameter.
	* Or [Array] of routes
* `Router.match()` takes an uri string or request object and returns the fitting route or `false` if no route was found
* `Router.reverse()` takes a route sring or id of a stored route and creates a new path(!)
	* for dynamic routes you must provide values for the dynamic route parts

**Example:**
```javascript
	route = {
		url : '/ex/@am/...ple',
		id : 'ex'
		...
	}
	Router.reverse('ex',{ am : 'abc', ple : ['1', '2', '3'] })
	--> '/ex/abc/1/2/3'
```
* `Router.static()` takes an (evaluated) route object or uri and serves static file depending on an optionally given basepath

**Example:**
```javascript
	GET /static/path/to/file.js

	will evaluate to:
	route = '/static/...$path',
	...
	params : {
		'$path' : ['path', 'to', 'file.js']
	}

	Router.static(route)(req, res)
	--> will serve /path/to/file.js
```

##HTTP API
### Request
* `Request.uri` returned uri object from  nodes url module
	* also includes host and hostname from headers object
* `Request.cookies` evaluated cookies
* `Request.info` wraps all important keys into one object (used intern)
### Response
TODO: write docs















