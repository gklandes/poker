var express = require('express');
var app = express();
var appPort = process.argv[2] || 8080;

app.use(express.static('src'));

app.listen(appPort, function () {
  console.log('Poker app is up!');
});
