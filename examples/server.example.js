var Router = require('../')
var app = Router.create()


var args = process.argv
var routes = args.splice(2)





routes = (routes.length === 0 )
? require('fs')
.readdirSync(__dirname + '/routes/')
.filter(function(route){
	return (route.substr(-3) === '.js')
})
: routes




routes.map(function(route){
	return require('path').resolve(__dirname, './routes/', route)
}).forEach(function(route){
	console.log(route)
	app.parse(route)
})


console.log(app.table())


// ** Static Routes ** //
// Serves from /tests/public
app.route({
	url: '/',
	type: 'static'
})
// Serves from /tests/www
app.route({
	url: '/static/',
	type: 'static',
	options: {
		path : require('path').join( __dirname , 'www')
	}
})





require('http').createServer(function (req, res) {
	app(req, res, function (err, msg) {
		console.log(require('util').inspect(msg,{depth : 1}))
	})
}).listen(3000)
//}).listen(3000, '127.0.0.1')

console.log('Test server running on http://127.0.0.1:3000'
+ '\nopen http://127.0.0.1:3000/examples.html'
+'\n\n\n'
+ 'activated routes:'
+ app.table().map(
	function(route){
		return '\n' + route.url

	}).sort())
