var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var momSchema = new Schema({
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
    exAlumna: Boolean,
    yearStudy: String,
    inactivar: Boolean

});
module.exports = mongoose.model('Mom', momSchema, 'mom');