var express = require('express');
var SSE = require('express-sse');
var requireDir = require("require-dir");

var app = express();
var router = express.Router();
var appPort = process.argv[2] || 8080;
app.locals.sse = new SSE(['SSE connected']);


// start the app
app.listen(appPort, function () {
    console.log('Poker app is up!');
});

// handle static files
app.use(express.static('src'));

// handle sse
app.get('/sse', app.locals.sse.init);

// handle REST API
var routes = requireDir('./routes');
for (var i in routes) {
    app.use('/api', routes[i]);
}