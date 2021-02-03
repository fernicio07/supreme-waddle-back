var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pagosSchema = new Schema({

    codigoFamilia: String,
    
    montoTotalAnualPagado: Number,

    montoTotalMatriculaStudentsPagado: Number,
    montoTotalSeguroStudentsPagado: Number,
    montoTotalAdmissionFeeStudentsPagado: Number,
    montoTotalAnualMensualidadGradoStudentsPagado: Number,
    montoTotalMensualidadGradoStudentsPagado: Number,
    mensualidadInstruccionPagado: Number,
    montoGraduationFeePagado: Number,

    montoYearbookPagado: Number,
    montoMaintenanceFeePagado: Number,
    montoSecurityFeePagado: Number,
    montoTechnologyFeePagado: Number,
    montoTotalCuidoPagado: Number,

    fechaCreoRegistro : String,
    fechaCreoPago: String,

    montoDonationFeePagado: Number,

    tipoPago: String,
    numeroDeCheque: String,
    banco: String,
    totalPago: Number,
    montoRecargoPagado: Number,
    montoLibrosDigitalesPagado: Number,
    inactivar: Boolean,

    fromDateAnio: Number,
    toDateAnio: Number,
    codigoDeposito: String

});
module.exports = mongoose.model('Pago', pagosSchema, 'pago');