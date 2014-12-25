# Route Definitions

This is an indepth explination about how routes are defined in Quiver-Router.

## Structure
```javascript
var Router = require('Router').create([options])

Router.route({
	url : '/url',    >> String reqresenting the path the route fires on
	id  : 'any.id',  >> Unique identifier
	methods : {
		default : function(req, res, next){}
		get 	: function(req, res, next){}
		post	: function(req, res, next){}
		etc.
		>> handlers for the route
		* if connecting route has handler this is called
		* else default handler is called
		* if no default handler exists an (internal) error is raised
	},
	middleware : [fn1, fn2, ..., fnN],
		>> middleware functions or redirectors
		>> must have following scheme : function(req, res, next){}
		>> redirectors: url or id of a route
		>> optional
	type : 'dynamic'    >> type of route (dynamic or static)
	                    >> defaults to dynamic
	options : {
		template : {}   >> optioal configuration
		path : '...'    >> used by static routes
	}
})
```

## In depth
### URL

#### Params
...-Router allows two (three) types of parameters
1. simple parameters (defined by a leading `@`-Sign)
2. multiple parameters (defined by leading `...`)
	matches until end or next param in route is found
3. no parameters (obviously)

**In action:**

```javasript
Router.route({
	url : '/params/@simple/...multi'
	...
})
>> connect on './params/foo/bar/baz
results in req.params = {
	simple : 'foo',
	multi  : ['bar', 'baz']
}
```

On static routesyou can add a `...$path` param to identify a nested path match.
If you don't  the `...$path` param is added to the end.

### ID
**Optional**
Can be used as second identifier to url to modify the route OnTheFly.

For example the default ids of Router's error routes are `qvr.errors.404` and `qvr.errors.500`

### Methods
You can define handlers for any method that should be accessable on the route by adding a function under the method representing attribute written either upper or lowercase.
The handlers are called after the [middleware](./routedef.md#middleware) in a stack independent from the host manager.
Their scheme is the default middleware scheme (`function(req, res, next){}`)

**Example:**
```javascript
Router.route({
...
	methods : {
		GET : function(req, res, next){...}, >> called on GET requests
		POST : function(req, res, next){...}, >> called on POST requests
		default : function(req, res, next){...} >> called when no matching handler is present
	}
...
})
```

### Middleware
Define middleware stack by supplying an array of middleware functions (`[fn1, fn2, ..., fnN]`)
These functions must follow the default middleware scheme (`function(req, res, next)`).
Though to [ArrowJS](https://github.com/yangodev/ArrowJS) being used as middleware manager you can store function comprehensive data in the `this` object.

Beside from functions you can add other routes ID or URL to the stack which will inherit their middleware.


### Type
The `type` attribute defines whether the route points on static content or dynamic builders.
By default routes are `type : dynamic` so you just need to set `static` if you intend to serve static content.


### Options
This object contains all optional configuration.
These are some options used to configure your route:
+ `path` >> defines static file's root path
+ `template` >> [object] containing configuration for templating
+ [see more](./API.md)






