var express = require('express');
var SSE = require('express-sse');
var bodyParser = require('body-parser');

var app = express();
var router = express.Router();
var appPort = process.argv[2] || 8080;
var sse = new SSE(['hello']);
var appData = { 
    games: [{ id: 1, name: 'one' }, { id: 2, name: 'two' }]
};

// start the app
app.listen(appPort, function () {
    console.log('Poker app is up!');
});

// handle static files
app.use(express.static('src'));

// handle sse
app.get('/sse', sse.init);

// handle REST API
app.use('/api', router);
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(function(req, res, next) {
    next();
});
router.get('/', function(req, res) {
    res.json(Object.keys(appData));
});

router.route('/games(/:id)?')
    .get(function (req, res) {
        if (!req.params.id) {
            console.log('get all');
            res.json(appData.games);
        } else {
            var found = false;
            console.log('get');
            for (var i in appData.games) {
                if (appData.games[i].id == req.params.id) {
                    res.json(appData.games[i]);
                    found = true;
                    break;
                }
            }
            if (!found) {
                res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'});
                res.end('Not Found');
            }
        }
    })
    .post(function (req, res) {
        console.log('post', req.body);
        if (req.body.name) {
            var newGame = {id: appData.games.length + 1, name: req.body.name };
            appData.games.push(newGame);
            res.json(newGame);
            sse.send({ type: 'game', action: 'new', data: newGame});
        } else {
            res.writeHead(400, 'Bad Request', {'Content-Type': 'text/plain'});
            res.end('"Name" is a required field.');
        }
    })
    .put(function(req, res) {
        console.log('put', req.params, req.body);
        var newGame, id = req.params.id;
        var found = false;
        if (!id){
            res.writeHead(405, 'Method Not Allowed', {'Content-Type': 'text/plain'});
            res.end('Method Not Allowed');
            return;
        }
        for (var i in appData.games) {
            if (appData.games[i].id == id) {
                newGame = appData.games[i];
                found = true;
                break;
            }
        }
        if (!found) {
            res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'});
            res.end('Not Found');
            return;
        }
        if (req.body.name) {
            newGame.name = req.body.name;
            sse.send({ type: 'game', action: 'update', data: newGame});
            res.json(newGame);
        } else {
            res.writeHead(400, 'Bad Request', {'Content-Type': 'text/plain'});
            res.end('"Name" is a required field.');
        }
    })
    .delete(function (req, res) {
        console.log('delete', req.params);
        var id = req.params.id;
        if (!id){
            res.writeHead(405, 'Method Not Allowed', {'Content-Type': 'text/plain'});
            res.end('Method Not Allowed');
            return;
        }
        for (var i in appData.games) {
            if (appData.games[i].id == id) {
                appData.games.splice(i,1);
                found = true;
                sse.send({ type: 'game', action: 'delete', data: null });
                res.writeHead(204, 'No Content', {'Content-Type': 'text/plain'});
                res.end('Deleted');
                break;
            }
        }
        if (!found) {
            res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'});
            res.end('Not Found');
        }
    })
    ;
