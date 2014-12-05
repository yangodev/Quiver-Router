module.exports = exports = function(app){


	// ** Dynamic Routes w/o params ** //
	// 1.0 show that simple dynamic routes work ( url : /api )
	app.route({
		url: '/api',
		methods: {
			default: function (req, res, next) {
				res.serve('/api')
				return next()
			}
		},
		options: {}
	})



	// 1.1 to show all set routes ( url : /api/table )
	app.route({
		url: '/api/table',
		methods: {
			default: function (req, res, next) {
				res.serve(require('util').inspect(app.table()))
				return next()
			}
		}
	})


}
