module.exports = exports = function(app){


	// ** 4.0 API ** //
	// 4.1 Route reversing
	app.route({
		url: '/api/reverse/@id',
		methods: {
			default: function (req, res, next) {
				var route = app.table.id(req.route.params.id)
				if (!route) { res.serve('No such route'); return next() }

				var url = route.reverse(req.route.query)

				res.serve(url)
				return next()
			}
		}
	})


}
