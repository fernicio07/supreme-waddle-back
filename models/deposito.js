var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Pago = require('../models/pago');


var depositoSchema = new Schema({
    fecha: String,
    numeroDeposito: String,
    pagos: [{ type: Schema.ObjectId, ref: 'Pago' }],
    totalTotalPago: Number,
    totalGraduacion: Number,
    totalMantenimiento: Number,
    totalSeguridad: Number,
    totalTecnologia: Number,
    totalCuido: Number,
    totalMatricula: Number,
    totalDonativo: Number,
    totalMensualidad: Number,
    totalSeguro: Number,
    totalAnuario: Number,
    totalLibrosDigitales: Number,
    totalRecargos: Number,
    totalDeposito: Number,

    inactivar: Boolean,
    fromDateAnio: Number,
    toDateAnio: Number
});
module.exports = mongoose.model('Deposito', depositoSchema, 'deposito');