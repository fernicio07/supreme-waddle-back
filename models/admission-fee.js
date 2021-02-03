var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var admissionFeeSchema = new Schema({
    name: String,
    cost: Number,
    category: String
});
module.exports = mongoose.model('AdmissionFee', admissionFeeSchema, 'admissionFee');