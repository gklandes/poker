// var nodemailer = require('nodemailer');
// var sendmailTransport = require('nodemailer-sendmail-transport');
// var transporter = nodemailer.createTransport(sendmailTransport(options));

// function Mailer () {
//     // stub module for mail functions
// }
// Mailer.prototype.send = function (config, cb) {
//     for (var p in config) {
//         console.log(config[p]);
//     }
//     return cb(null,true);
// };


// Mailer
module.exports = {
    send: function (config, cb) {
        for (var p in config) {
            console.log(p, '>', config[p]);
        }
        if (cb) cb(null,true);
        return true;
    }
};