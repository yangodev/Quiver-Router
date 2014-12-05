module.exports = exports = function(app){


	// ** COOKIE ** //
	// 5.1 Single COOKIE
	app.route({
		url : '/api/cookie/single/@name/@val/',
		methods : {
			default : function(req, res, next){
				var name	= req.route.params['name']
				var val		= req.route.params['val']


				res.headers.cookie(name, val, {
					path : '/api/cookie/read',
					maxAge : 20
				})
				/*res.serve ( 'set cookie '
						   + name
						   + ' with value '
						   + val )
				*/

				res.redirect('/api/cookie/read')
				return next()
			}
		}
	})


	// 5.2 Multi COOKIES
	app.route({
		url : '/api/cookie/multi/...names/$/...values/$/@age/',
		methods : {
			default : function(req, res, next){
				var names = req.route.params['names']
				var values = req.route.params['values']
				var maxAge = req.route.params['age']
				var opt = {
					path : '/api/cookie/read/',
					maxAge : maxAge
				}

				for (var c = 0; c < names.length; c++){
					if(values[c]) { res.cookie(names[c], values[c], opt) }
				}
				res.headers.set('content-type', 'text/html')
				res.serve('<!DOCTYPE html>' +
						  '<html lang="">' +
						  '<head>' +
						  '<meta http-equiv="refresh" content="0;url=/api/cookie/read/">' +
						  '</head>' +
						  '</html>'
						 )
			}

		}


	})


	// prints cookies
	app.route({
		url : '/api/cookie/read/',
		methods : {
			default : function(req, res, next){
				var cookies = req.cookies
				res.serve(cookies)

				return next()
			}

		}
	})


}
