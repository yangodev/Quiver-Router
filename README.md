
# Strassenamt

## What it is:
The  for short is a simple HTTP Router for node.js. It uses RouteDefinitions (Objects representing accesspoints) to isolate accessable routes of your server.
It can be used either standalone or in connection with another framework like [ArrowJS](https://github.com/yangodev/arrowjs) or [ExpressJS](http://expressjs.com/).

--------

## Features:
* highly accessable RouteDefinitions
* support for parameters in routes
	* simple parameters (defined by: `@` + optional name)
	* multiple parameters (defined by: `...` + optional name)
* static file routing implemented
* API for template support
* intern response helpers for
	* headers & cookies
	* templates
	* static files
	* and more
* light codebase ( ~800 loc )
* **It's Independent!**

--------

## Usage

#### Install it
```
npm install xyz
```

#### Include it
```javascript
var Router = require('xyz').create([options]);
Router.route(RouteDefinition);

// Using with a framework:
app.use(Router);

// or standalone:
require('http').createServer(request, response){
	router(request, response, function(err, msg){
		console.log( msg ); // logs router messages
	}
}	
```
--------
#### `Router.route()`
This function takes a RouteDefinition and adds it to the intern table or updates an existing one.
```javascript
...
Router.route({
	url : '/example/url',
	id  : 'example.id',
	methods : {
		GET : function(request, response, next){
			response.serve('Served ' + request.url.pathname);
			return next();
		}
	},
	// Optional
	middleware : [ /* middleware functions */],
	type : 'dynamic',
	options : {
		// further options
	}
});
```
Detailed Information [here](./docs/routedef.md)
* valid [URLs](./docs/routedef.md#URL)
* [Parameters](./docs/routedef.md#parameters)
* [methods](./docs/routedef.md#methods)
* [middleware](./docs/routedef.md#middleware)
* [type](./docs/routedef.md#type)
* [options](./docs/routedef.md#options)

-------

API documentation can be found [here](./docs/API.md).
