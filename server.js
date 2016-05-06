var express = require('express');
var bodyParser = require('body-parser');
var SSE = require('express-sse');
var session = require('express-session');
var requireDir = require("require-dir");
var mongoose   = require('mongoose');
var MongoDBStore = require('connect-mongodb-session')(session);
var md5 = require('md5');

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
var User = require('./models/user.model');
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
    var creds, result = { authenticated: false, error: null };
    var isNew = !!req.body.new;
    if (!req.body.email || !req.body.password) {
        result.error = "Please provide both email and password";
        res.json(result);
    } else {
        creds = {
            email: req.body.email,
            passwordHash: md5(req.body.password)
        };
        console.log('POST login',creds,isNew);
        if (isNew) User.create(creds, finishLogin);
        else User.authenticate(creds, finishLogin);
    }

    function finishLogin (err, user) {
        console.log('finish login',err, user);
        // debugger;
        if (err) {
            result.error = err;
            res.json(result);
        } else {
            if (user) {
                req.session.isLoggedIn = true;
                req.session.user = creds.email;
                result.authenticated = true;
                res.json(result);
            } else {
                result.error = 'Your account could not be ' + (isNew ? 'created' : 'found');
                res.json(result);
            }
        }
    }
});
app.get('/logout', function(req, res) {
    req.session.isLoggedIn = false;
    req.session.user = null;
    res.send(req.session);
});