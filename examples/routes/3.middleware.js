module.exports = exports = function(app){

	// ** middleware ** //
	// 3.1 middleware
	app.route({
		url: '/api/multistack',
		methods: {
			default: function (req, res, next) {
				res.serve('finally')
				return next()
			}
		},
		middleware: [

			function one(req, res, next) {
				res.serve('first layer \n', false)
				return next()
			},
			function two(req, res, next) {
				res.serve('second layer \n', false)
				return next()
			},
			function three(req, res, next) {
				res.serve('third layer \n', false)
				return next()
			}
		],
		options: {}
	})


	// 3.2 inheritance through url ( url : /api/inherits/url )
	app.route({
		url: '/api/inherits/url',
		id: '$inh',
		methods: {
			default: function (req, res, next) {
				res.serve(res.data)
				return next()
			}
		},
		middleware: ['/api/multistack']
	})


	// 3.3 inheritance through id
	app.route({
		url: '/api/inherits/id',
		methods: {
			default: function (req, res, next) {
				res.serve(res.data)

				return next()
			}
		},
		middleware: [
			'/api/multistack', '$inh',
			function (x, y, next) {
				y.serve('jkghhg', false)
				return next()
			}
		]
	})


}
