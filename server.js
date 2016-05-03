var express = require('express');
var bodyParser = require('body-parser');
var SSE = require('express-sse');
var session = require('express-session');
var requireDir = require("require-dir");
var mongoose   = require('mongoose');
var MongoDBStore = require('connect-mongodb-session')(session);

var mongooseUri = 'mongodb://localhost:27017/poker';
mongoose.connect(mongooseUri); // connect to our database

var app = express();
var appPort = process.argv[2] || 8080;
app.locals.sse = new SSE(['SSE connected']);

// start the app
app.listen(appPort, function () {
    console.log('Poker app is up!');
});
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'yougot2knowwhen2holdem',
    cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 * 4 // 4 weeks 
    },
    store: store
}));

// handle static files
app.use(express.static('src'));

// handle sse
app.get('/sse', app.locals.sse.init);

// handle REST API
var routes = requireDir('./routes');
app.use('/api', authMiddleware);
app.get('/api', function (req, res) { res.json('Welcome to the Poker API'); });
for (var i in routes) {
    app.use('/api', routes[i]);
}

// session mgmt
var store = new MongoDBStore({
    uri: mongooseUri,
    collection: 'usersessions'
});
// },function (error) {
// });
// store.on('error', function(error) {
//     console.log(error);
// });
app.get('/session', function(req, res) {
    res.json(req.session);
});
function authMiddleware (req, res, next) {
    if (req.session.loggedIn) next();
    else res.status(401).send('Authentication Required');
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/login', function(req, res) {
    if (req.body.email && req.body.password && req.body.password === 'go') {
        req.session.loggedIn = true;
        req.session.user = req.body.email;
        res.send(req.session);
    } else {
        req.session.loggedIn = false;
        req.session.user = null;
        res.send(req.session);
    }
});
app.get('/logout', function(req, res) {
    req.session.loggedIn = false;
    req.user = null;
    res.send(req.session);
});