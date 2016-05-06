var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    passwordHash: String,
});
UserSchema.statics.findByEmail = function(val, cb) {
    return this.model('User').find({ email: val }, cb);
};
UserSchema.statics.authenticate = function(creds, cb) {
    return this.model('User').findOne(creds, cb);
};

module.exports = mongoose.model('User', UserSchema);