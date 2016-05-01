var mongoose = require('mongoose');
var gravatar = require('gravatar');

var GameSchema = new mongoose.Schema({
    name: {type: String, required: true },
    open: Boolean,
    owner: { type: Number, ref: 'User' },
    code: { type: String }
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
GameSchema
    .virtual('owner.gravatar')
    .get(function () {
        // return gravatar.url(this.owner); // TODO: need a user session to supply email
        return gravatar.url('gklandes@gmail.com'); // TODO: need a user session to supply email
})

module.exports = mongoose.model('Game', GameSchema);