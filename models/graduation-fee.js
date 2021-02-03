var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var graduationFeeSchema = new Schema({
    name: String,
    cost: Number
});
module.exports = mongoose.model('GraduationFee', graduationFeeSchema, 'graduationFee');