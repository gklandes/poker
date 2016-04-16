var express = require('express');
var SSE = require('express-sse');
var app = express();
var appPort = process.argv[2] || 8080;
var sse = new SSE(['hello']);

// start the app
app.listen(appPort, function () {
    console.log('Poker app is up!');
});

// handle static files
app.use(express.static('src'));

// handle sse
app.get('/sse', sse.init);
