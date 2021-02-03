const mongoose = require('mongoose')

const Schema = mongoose.Schema;
const Dad = require('../models/dad');
const Student = require('../models/student');
const Mom = require('../models/mom');
const Guardian = require('../models/guardian');
const AdmissionFee = require('../models/admission-fee');
const EstadoCuentaFamily = require('../models/estado-cuenta-family');
const Pago = require('../models/pago');

const familySchema = new Schema({
    codigoFamilia: String,
    students: [{type: Schema.ObjectId, ref: "Student"}],
    dad: { type: Schema.ObjectId, ref: "Dad" },
    mom: { type: Schema.ObjectId, ref: "Mom" },
    guardian: { type: Schema.ObjectId, ref: "Guardian" },
    estadoCuenta: [{ type: Schema.ObjectId, ref: 'EstadoCuentaFamily' }],
    pagos: [{ type: Schema.ObjectId, ref: 'Pago' }],
    admisionFeeFamily: Array,
    pagoAutomatico: Boolean,
    addFormGuardian: Boolean,
    tipoTarjeta: String,
    planPagoDonaciones: Number,
    distribuirTotal: Number,
    cuantoPagaInstruccion: Number,
    cuantoPagaDonativo: Number,
    cuantoPagaCuido: Number,
    inactivar: Boolean,
    // billingAddress: String,
    // circularAddress: String
    addressFacturacionLineOne: String,
    addressFacturacionLineTwo: String,
    addressFacturacionCity: String,
    addressFacturacionCountry: String,
    facturacionZipCode: String,
    addressCircularLineOne: String,
    addressCircularLineTwo: String,
    addressCircularCity: String,
    addressCircularCountry: String,
    circularZipCode: String
})

module.exports = mongoose.model('Family', familySchema, 'family');