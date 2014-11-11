var Router = require('../')
var app = Router.create()


app
// this route is set

// ** Dynamic Routes w/o params ** //
// 1.0 to show that simple dynamic routes work ( url : /api )
.route({
  url: '/api',
  methods: {
    default: function (req, res, next) {
      res.end('/api')
      return next()
    }
  },
  options: {}
})
// 1.1 to show all set routes ( url : /api/table )
.route({
  url: '/api/table',
  methods: {
    default: function (req, res, next) {
      res.send(require('util').inspect(app.table()))
      res.done()
      next()
    }
  }
})
// 1.2. to show how middleware works ( url : /api/multistack )
.route({
  url: '/api/multistack',
  methods: {
    default: function (req, res, next) {
      res.send('finally')
      res.done()
      return next()
    }
  },
  middleware: [

    function one(req, res, next) {
      res.send('first layer \n')
      return next()
    },
    function two(req, res, next) {
      res.send('second layer \n')
      return next()
    },
    function three(req, res, next) {
      res.send('third layer \n')
      return next()
    }
  ],
  options: {}
})
// ** Params ** //
// 2.1 to show simple params ( url : /api/param/simple/paramvalue )
.route({
  url: '/api/param/simple/@param',
  methods: {
    default: function (req, res, next) {
      res.send(req.route.params.param)
      res.done()
      return next()
    }
  }
})
// 2.2 to show multiparams ( url : /api/param/multi/params/go/here )
.route({
  url: '/api/param/multi/...params',
  methods: {
    default: function (req, res, next) {
      res.send(req.route.params.params)
      res.done()
      next()
    }
  }
})
// ** middleware inheritance ** //
// 3.1 inheritance through url ( url : /api/inherits/url )
.route({
  url: '/api/inherits/url',
  id: '$inh',
  methods: {
    default: function (req, res, next) {
      res.end(res.data)
      return next()
    }
  },
  middleware: ['/api/multistack']
})
// 3.2 inheritance through id
.route({
  url: '/api/inherits/id',
  methods: {
    default: function (req, res, next) {
      res.end(res.data)
      return next()
    }
  },
  middleware: [
    '/api/multistack', '$inh',
    function (x, y, next) {
      y.send('jkghhg')
      return next()
    }
  ]
})
// ** Static Routes ** //
// Serves from /tests/public
.route({
  url: '/',
  type: 'static'
})

require('http').createServer(function (req, res) {
  app(req, res, function (err, msg) {
    console.log(msg)
  })
}).listen(3000, '127.0.0.1')

console.log('Test server running on http://127.0.0.1:3000'
            + '\nopen http://127.0.0.1:3000/example.html' )
