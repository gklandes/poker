var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    name: {type: String, required: true }
});

module.exports = mongoose.model('Game', GameSchema);