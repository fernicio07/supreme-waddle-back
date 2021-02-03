var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donationFeeSchema = new Schema({
    name: String,
    cost: Number
});
module.exports = mongoose.model('DonationFee', donationFeeSchema, 'donationFee');