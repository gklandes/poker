var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    name: {type: String, required: true },
    open: Boolean,
    owner: { type: Number, ref: 'User' }
});

module.exports = mongoose.model('Game', GameSchema);