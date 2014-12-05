module.exports = exports = function(app){


	// ** Params ** //
	// 2.1 to show simple params ( url : /api/param/simple/paramvalue )
	app.route({
		url: '/api/param/simple/@param',
		id: 'param.simple',
		methods: {
			default: function (req, res, next) {
				res.serve(req.route.params.param)
				return next()
			}
		}
	})

	
	// 2.2 to show multiparams ( url : /api/param/multi/params/go/here )
	app.route({
		url: '/api/param/multi/...params',
		methods: {
			default: function (req, res, next) {
				res.serve(req.route.params.params)
				return next()
			}
		}
	})


}
