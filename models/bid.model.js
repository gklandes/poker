var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var BidSchema = new Schema({
    value: Number,
    user: { type: Number, ref: 'User' },
});

module.exports = mongoose.model('Bid', BidSchema);