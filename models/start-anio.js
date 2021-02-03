var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var startAnioSchema = new Schema({
    fromDateAnio: Number,
    toDateAnio: Number
});
module.exports = mongoose.model('StartAnio', startAnioSchema, 'startAnio');