var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var User = require('../models/user.model');

module.exports = router;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.route('/users(/:id)?')
    .get(function (req, res) {
        if (!req.params.id) {
            console.log('get all');
            User.find(function(err, users) {
                if (err) res.send(err);
                else res.json(users);
            });
        } else {
            console.log('get', req.params.id);
            User.findById(req.params.id, function(err, user) {
                if (err) res.status(500).send(err);
                else{
                    if (user) res.send(user);
                    else res.status(404).end('Not Found');
                }
            });
        }
    })
    .post(function (req, res) {
        console.log('post', req.body);
        var user = new User();
        if (user.name !== undefined) user.name = req.body.name;
        if (user.email !== undefined) user.email = req.body.email;
        if (req.body.password !== undefined) user.passwordHash = md5(req.body.password);
        user.save(function(err) {
            if (err) res.status(500).send(err);
            else res.send(req.body);
        });
    })
    .put(function(req, res) {
        console.log('put', req.params.id, req.body);
        User.findById(req.params.id, function(err, user) {
            if (err) res.status(500).send(err);
            else if (!user) res.status(404).end('Not Found');
            else {
                if (user.name !== undefined) user.name = req.body.name;
                if (user.email !== undefined) user.email = req.body.email;
                if (req.body.password !== undefined) user.passwordHash = md5(req.body.password);
                user.save(function(err) {
                    if (err) res.status(500).send(err);
                    res.send(user);
                });
            }
        });
    })
    .delete(function (req, res) {
        console.log('delete', req.params.id);
        User.remove({
            _id: req.params.id
        }, function(err, user) {
            if (err) res.status(500).send(err);
            else if (!user) res.status(404).end('Not Found');
            else res.status(204).end('No Content');
        });
    })
    ;