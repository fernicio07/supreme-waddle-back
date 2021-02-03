var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dadSchema = new Schema({
    codigoFamilia: String,
    name: String,
    // middleName: String,
    lastName: String,
    //maidenName: String,
    occupation: String,
    company: String,
    // physicalAddress: String,
    // mailingAddress: String,
    homePhone: String,
    workPhone: String,
    mobilePhone: String,
    email: String,
    hobby: String,
    inactivar: Boolean
});
module.exports = mongoose.model('Dad', dadSchema, 'dad');