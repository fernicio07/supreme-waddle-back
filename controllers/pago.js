'use strict'

var Pago = require('../models/pago');
var Family = require('../models/family');
var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var controller = {

    savePago: async(req, res) => {
        var pago = new Pago();
        var params = req.body;
        // var mesesPagado = 0;

        try {
            let familia = await Family.find({codigoFamilia: params.codigoFamilia}, {pagos: 1, estadoCuenta: 1}, {sort: {codigoFamilia: -1}})
            .populate({
                path: 'estadoCuenta',
                match: { inactivar: false }
            })
            .populate({
                path: 'pagos',
                match: { inactivar: false }
            });

            pago.codigoFamilia = params.codigoFamilia;    
            pago.montoTotalAnualPagado = params.montoTotalAnualPagado;
            pago.montoTotalMatriculaStudentsPagado = params.montoTotalMatriculaStudentsPagado;
            pago.montoTotalSeguroStudentsPagado = params.montoTotalSeguroStudentsPagado;
            pago.montoTotalAdmissionFeeStudentsPagado = params.montoTotalAdmissionFeeStudentsPagado;
            pago.montoTotalAnualMensualidadGradoStudentsPagado = params.montoTotalAnualMensualidadGradoStudentsPagado;
            pago.montoTotalMensualidadGradoStudentsPagado = params.montoTotalMensualidadGradoStudentsPagado;
            pago.mensualidadInstruccionPagado = params.mensualidadInstruccionPagado;
            pago.montoGraduationFeePagado = params.montoGraduationFeePagado;

            pago.montoYearbookPagado = params.montoYearbookPagado;
            pago.montoMaintenanceFeePagado = params.montoMaintenanceFeePagado;
            pago.montoSecurityFeePagado = params.montoSecurityFeePagado;
            pago.montoTechnologyFeePagado = params.montoTechnologyFeePagado;
            pago.montoTotalCuidoPagado = params.montoTotalCuidoPagado;

            pago.fechaCreoRegistro  = params.fechaCreoRegistro ;
            pago.fechaCreoPago = params.fechaCreoPago;

            pago.montoDonationFeePagado = params.montoDonationFeePagado;

            pago.tipoPago = params.tipoPago;
            pago.numeroDeCheque = params.numeroDeCheque;
            pago.banco = params.banco;            
            pago.totalPago = params.totalPago;
            pago.montoRecargoPagado = params.montoRecargoPagado;
            pago.montoLibrosDigitalesPagado = params.montoLibrosDigitalesPagado;
            pago.inactivar = false;
            pago.codigoDeposito = null;
            pago.fromDateAnio= params.fromDateAnio;
            pago.toDateAnio= params.toDateAnio;

            let estadoCuenta = familia[0].estadoCuenta[0];

            estadoCuenta.mesesPendientesPagarMensualidad = params.mesesPendientesPagarMensualidad;
            // console.log(params);
            // return;

            let pagoDB = await pago.save();
            familia[0].pagos.push(pagoDB);

            // Actualiza los meses Pendientes
            await EstadoCuentaFamily.findByIdAndUpdate(estadoCuenta._id, {$set : {mesesPendientesPagarMensualidad: estadoCuenta.mesesPendientesPagarMensualidad}}, {new:true, useFindAndModify: false});

            await Family.findByIdAndUpdate(familia[0]._id, {$set: {pagos: familia[0].pagos, estadoCuenta: estadoCuenta}}, {new:true, useFindAndModify: false});

            return res.status(200).send({
                messagge: 'Pago creado correctamente',
                status: true
            });
        } catch (err) {
            console.log('err' + err);
            res.status(500).send(err);
        }

    },

    updatePago: function(req, res) {
        var idPago = req.params.id;
        var pago = req.body;

        let updateFields = {
            $set: {
                montoYearbookPagado: pago.anuario,
                banco: pago.banco,
                montoTotalCuidoPagado: pago.cuido,
                montoDonationFeePagado: pago.donativo,

                fechaCreoPago: pago.fechaCreoPago,
                montoTotalAnualPagado: pago.montoTotalAnualPagado,
                montoTotalAdmissionFeeStudentsPagado: pago.montoTotalAdmissionFeeStudentsPagado,

                montoGraduationFeePagado: pago.graduacion,
                montoTotalAnualMensualidadGradoStudentsPagado: pago.instruccion,
                montoTotalMensualidadGradoStudentsPagado: pago.instruccion,
                mensualidadInstruccionPagado: pago.instruccion,
                montoLibrosDigitalesPagado: pago.librosDigitales,
                montoMaintenanceFeePagado: pago.mantenimiento,
                montoTotalMatriculaStudentsPagado: pago.matricula,
                numeroDeCheque: pago.numeroDeCheque,
                montoRecargoPagado: pago.recargo,
                montoSecurityFeePagado: pago.seguridad,
                montoTotalSeguroStudentsPagado: pago.seguro,
                montoTechnologyFeePagado: pago.tecnologia,
                tipoPago: pago.tipoPago,
                totalPago: pago.totalPago,
                codigoDeposito: pago.codigoDeposito ? pago.codigoDeposito : null
            }
        }

        Pago.findByIdAndUpdate(idPago, updateFields, {new:true, useFindAndModify: false}, (err, pago) => {
            if (err) return res.status(500).send({message: 'Error al actualizar.'});
            if (!pago) return res.status(404).send({message: 'No existe el pago para actualizar.'});

            return res.status(200).send({
                pago: pago,
                messagge: 'Pago actualizado correctamente',
                status: true
            });
        });
    },

    getPagos: function(req, res) {
        Pago.find({inactivar: false}, null, {sort: {codigoFamilia: 1}})
        .exec((err, pagos) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});
            if (!pagos) return res.status(404).send({message: 'No hay pagos para mostrar.'});

            return res.status(200).send({
                status: true,
                pagos
            });
        })
    },


    getPagosByTipoPago: async (req, res) => {
        try {
            let tipoPago = req.params.code;
            tipoPago = tipoPago.split('-');
            let tipoTarjeta = "";
            let listaPagos = [];
            let pagosRealizados = [];

            if(tipoPago[0] == 'VMPA' || tipoPago[0] == 'AEPA') {
                tipoTarjeta = tipoPago[0] == 'VMPA' ? {"$in":['Visa', "Mastercard"]} : 'Amex';

                let familia = await Family.find({pagoAutomatico: true, inactivar: false, tipoTarjeta: tipoTarjeta}, {pagos: 1}, {sort: {codigoFamilia: -1}})
                .populate({
                    path: 'pagos',
                    match: { inactivar: false, codigoDeposito: {"$in":["", null]} }
                });
                
                familia.forEach(familia => {
                    for (const pago in familia.pagos) {
                        let algo = familia.deposito.pagos.find(pay => pay._id === pago._id);
                        const element = familia.pagos[pago];
                        listaPagos.push(element);
                    }
                });
                pagosRealizados = listaPagos;

            } else {
                pagosRealizados = await Pago.find({ "tipoPago": {"$in":[tipoPago[0], tipoPago[1]]}, inactivar: false, codigoDeposito: {"$in":["", null]}}, null);
            }
            return res.status(200).send({
                pagosRealizados,
                status: true
            });
            
        } catch (error) {
            console.log('err' + error);
            res.status(500).send(error);
        }
    },
    
    deletePago: async(req, res) => {
        var pagoId = req.params.id;
        try {
            let pagoRemove = await Pago.findByIdAndRemove(pagoId, {new:true, useFindAndModify: false})
            return res.status(200).send({
                pago: pagoRemove,
                status: true
			});
        } catch (error) {
            console.log('err' + error);
            res.status(500).send(error);
        }
    },
}

module.exports = controller;