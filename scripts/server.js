var SSE = require('sse');
var http = require('http');
var ssePort = process.argv[2] || 8080;

var server = http.createServer(function(req, res) {
	console.log('request');
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('okay');
});
server.listen(ssePort, function() {
	var sse = new SSE(server);
	sse.on('connection', function(client) {
		console.log('connection');
		// client.send('hi there!');
		setInterval(function() { client.send('alive!')}, 1000);
	});
});
