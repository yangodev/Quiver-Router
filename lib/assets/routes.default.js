module.exports = function(app){


	// 404 Not Found
	var Err404 = {
		url : '/errors/404/...route',
		id : 'qvr.errors.404',
		methods:{
			default : function (req, res, next){
				var msg = 'ERROR: 404 -- File Not Found -- ' + new Date()
				res.writeHeader(404, { "Content-type" : 'text/plain'})
				res.end(msg)
				return next()
			}
		}
	}

	// 500 Server Error
	var Err500 = {
		url : '/errors/500/...route',
		id : 'qvr.errors.500',
		methods:{
			default : function (req, res, next){
				var msg = 'ERROR: 500 -- Internal Server Error -- ' + new Date()
				res.writeHeader(500, { "Content-type" : 'text/plain'})
				res.end(msg)
				return next()
			}
		}
	}




	app.route(Err404,Err500)

}
