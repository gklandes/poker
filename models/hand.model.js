var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var HandSchema = new Schema({
    issue: {type: String, required: true },
    game: { type: Number, ref: 'Game' },
    seq: Number
});

module.exports = mongoose.model('Hand', HandSchema);