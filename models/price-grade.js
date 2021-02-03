var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var priceGradeSchema = new Schema({
    name: String,
    cost: Number,
    code: Number
});
module.exports = mongoose.model('PriceGrade', priceGradeSchema, 'priceGrade');