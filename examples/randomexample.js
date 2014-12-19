var Router = require('../')
var app = Router.create()

app.route({
	url: '/api/multistack',
	methods: {
		default: function (req, res, next) {
			res.serve('finaljhghly', false)
			res.serve('finally', false)
			console.log(res.serve('gff'))
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
app.route({
	url : '/api/more/...thanone'
})


console.log(app.table.one({url:'/api/more/...thanone'}).reverse({thanone : ['hi', 'hoo']}))


require('http').createServer(function (req, res) {
	app(req, res, function (err, msg) {
		console.log(msg)
	})
}).listen(6554, '127.0.0.1')

console.log('Test server running on http://127.0.0.1:6554'
			+ '\nopen http://127.0.0.1:3000/examples.html'
			+'\n\n\n'
		   )
