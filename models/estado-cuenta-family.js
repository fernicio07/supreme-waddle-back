var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const DonationFee = require('../models/donation-fee');

var estadoCuentaFamilySchema = new Schema({
    codigoFamilia: String,
    totalAnual: Number,
    // montoTotalAnualPagado: Number,
    totalMensualidadGradoStudents: Number,
    totalAnualMensualidadGradoStudents: Number,
    // montoTotalAnualMensualidadGradoStudentsPagado: Number,
    totalMatriculaStudents: Number,
    // montoTotalMatriculaStudentsPagado: Number,
    totalSeguroStudents: Number,
    // montoTotalSeguroStudentsPagado: Number,
    totalAdmissionFeeStudents: Number,
    // montoTotalAdmissionFeeStudentsPagado: Number,
    yearbook: Number,
    security: Number,
    maintenance: Number,
    technology: Number,
    // montoYearbookPagado: Number,
    // montoMaintenanceFeePagado: Number,
    // montoSecurityFeePagado: Number,
    // montoTechnologyFeePagado: Number,
    // montoTotalMensualidadGradoStudentsPagado: Number,
    // mensualidadInstruccionPagado: Number,
    cuido: Number,
    // montoTotalCuidoPagado: Number,
    // montoAdmissionForStudentPagado: Number,
    // insuranceForStudent: Number,
    // fechaCreoRegistro : String,
    // fechaCreoPago: String,
    donationFee: [{ type: Schema.ObjectId, ref: "DonationFee" }],
    graduationFee: [{ type: Schema.ObjectId, ref: "GraduationFee" }],
    totalGraduationFee: Number,
    // montoDonationFeePagado: Number,
    // tipoPago: String,
    // montoGraduationFeePagado: Number,
    recargo: Number,
    // montoRecargoPagado: Number,
    mesesPendientesPagarMensualidad: Array,
    donativoFuturo: Number,
    donativoAnual: Number,
    totalMensualidadDonativo: Number,
    // montoTotalMensualidadDonativoPagado: Number,
    listaRecargo: Array,
    inactivar: Boolean,
    // numeroDeCheque: String,
    // banco: String,
    // totalPago: Number,
    montoLibrosDigitales: Number,
    fromDateAnio: Number,
    toDateAnio: Number
});
module.exports = mongoose.model('EstadoCuentaFamily', estadoCuentaFamilySchema, 'estadoCuentaFamily');