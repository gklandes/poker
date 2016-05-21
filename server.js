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
app.post('/register', function (req, res) {
    var creds = req.body;
    var result = { authenticated: false, error: null };
    if (!creds.name || !creds.email || !creds.password || !creds.confirm) {
        result.error = "Please provide all required fields.";
        res.json(result);
    } else if (creds.password !== creds.confirm) {
        result.error = "The password must match the confirm field.";
        res.json(result);
    } else {
        creds.confirm = undefined;
        User.create(creds, finishRegistration);
    }
    function finishRegistration (err, user) {
        if (err) throw err;

        console.log(user);
        initSession(user, req);
        result.authenticated = true;
        res.json(result);
    }
});
app.post('/login', function(req, res) {
    var creds = req.body;
    var result = { authenticated: false, error: null };

    if (!creds.email || !creds.password) {
        result.error = "Please provide both email and password";
        res.json(result);
    } else {
        console.log('POST login',creds);
        User.findOne({ email: creds.email },validate);
    }

    function validate (err, user) {
        if (err) throw err;
        if (!user) {
            result.error = 'User not found';
            res.json(result);
        } else {
            user.comparePassword(creds.password, function(err, isMatch) {
                if (err) throw err;

                if (isMatch) {
                    initSession(user, req);
                    result.authenticated = true;
                    res.json(result);
                }
                else {
                    result.error = 'The credentials could not be verified';
                    res.json(result);
                }
            });
        }
    }
});

function initSession (user, req) {
    console.log('initSession', user);
    req.session.loggedIn = true;
    req.session.user = user.email;
}

app.get('/logout', function(req, res) {
    req.session.loggedIn = false;
    req.session.user = null;
    res.send(req.session);
});