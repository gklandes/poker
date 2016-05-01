var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var Game = require('../models/game.model');

module.exports = router;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.route('/games(/:id)?')
    .get(function (req, res) {
        if (!req.params.id) {
            console.log('get all');
            Game.find(function(err, games) {
                if (err) res.send(err);
                else res.json(games);
            });
        } else {
            console.log('get', req.params.id);
            Game.findById(req.params.id, function(err, game) {
                if (err) res.status(500).send(err);
                else{
                    if (game) res.send(game);
                    else res.status(404).end('Not Found');
                }
            });
        }
    })
    .post(function (req, res) {
        console.log('post', req.body);
        var game = new Game();
        game.name = req.body.name;
        game.save(function(err) {
            if (err) res.status(500).send(err);
            else res.send(req.body);
        });
    })
    .put(function(req, res) {
        console.log('put', req.params.id, req.body);
        Game.findById(req.params.id, function(err, game) {
            if (err) res.status(500).send(err);
            else if (!game) res.status(404).end('Not Found');
            else {
                game.name = req.body.name;
                game.save(function(err) {
                    if (err) res.status(500).send(err);
                    res.send(game);
                });
            }
        });
    })
    .delete(function (req, res) {
        console.log('delete', req.params.id);
        Game.remove({
            _id: req.params.id
        }, function(err, game) {
            if (err) res.status(500).send(err);
            else if (!game) res.status(404).end('Not Found');
            else res.status(204).end('No Content');
        });
    })
    ;