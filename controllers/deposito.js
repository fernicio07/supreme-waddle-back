'use strict'

var Deposito = require('../models/deposito');
var Pago = require('../models/pago');

var controller = {

    saveDeposito: async(req, res) => {
        try {
            var deposito = new Deposito();

            var params = req.body;
            deposito.fecha = params.deposito;
            deposito.numeroDeposito = params.numeroDeposito;
            deposito.pagos = params.pagos;
            let pagos = params.pagos;

            // SET Valores
            deposito.totalTotalPago = 0;
            deposito.totalGraduacion = 0;
            deposito.totalMantenimiento = 0;
            deposito.totalSeguridad = 0;
            deposito.totalTecnologia = 0;
            deposito.totalCuido = 0;
            deposito.totalMatricula = 0;
            deposito.totalDonativo = 0;
            deposito.totalMensualidad = 0;
            deposito.totalSeguro = 0;
            deposito.totalAnuario = 0;
            deposito.totalLibrosDigitales = 0;
            deposito.totalRecargos = 0;
            deposito.totalDeposito = 0;

            for (const pago of pagos) {
                // Actualiza el codigoDeposito en cada pago seleccionado
                await Pago.findByIdAndUpdate(pago._id, {$set:{codigoDeposito: deposito.numeroDeposito}}, {new:true, useFindAndModify: false});

                deposito.totalTotalPago += pago.totalPago;
                deposito.totalDeposito += pago.totalPago;
                deposito.totalGraduacion += pago.montoGraduationFeePagado;
                deposito.totalDeposito += pago.montoGraduationFeePagado;
                deposito.totalMantenimiento += pago.montoMaintenanceFeePagado;
                deposito.totalDeposito += pago.montoMaintenanceFeePagado;
                deposito.totalSeguridad += pago.montoSecurityFeePagado;
                deposito.totalDeposito += pago.montoSecurityFeePagado;
                deposito.totalTecnologia += pago.montoTechnologyFeePagado;
                deposito.totalDeposito += pago.montoTechnologyFeePagado;
                deposito.totalCuido += pago.montoTotalCuidoPagado;
                deposito.totalDeposito += pago.montoTotalCuidoPagado;
                deposito.totalMatricula += pago.montoTotalMatriculaStudentsPagado;
                deposito.totalDeposito += pago.montoTotalMatriculaStudentsPagado;
                deposito.totalDonativo += pago.montoDonationFeePagado;
                deposito.totalDeposito += pago.montoDonationFeePagado;
                deposito.totalMensualidad += pago.montoTotalMensualidadGradoStudentsPagado;
                deposito.totalDeposito += pago.montoTotalMensualidadGradoStudentsPagado;
                deposito.totalSeguro += pago.montoTotalSeguroStudentsPagado;
                deposito.totalDeposito += pago.montoTotalSeguroStudentsPagado;
                deposito.totalAnuario += pago.montoYearbookPagado;
                deposito.totalDeposito += pago.montoYearbookPagado;
                deposito.totalLibrosDigitales += pago.montoLibrosDigitalesPagado;
                deposito.totalDeposito += pago.montoLibrosDigitalesPagado;
                deposito.totalRecargos += pago.montoRecargoPagado;
                deposito.totalDeposito += pago.montoRecargoPagado;
            }

            // Dates
            deposito.fromDateAnio = params.fromDateAnio;
            deposito.toDateAnio = params.toDateAnio;
            deposito.inactivar = false;

            // console.log(deposito);
            
            deposito.save((err, depositoStored) => {
                if (err) return res.status(500).send({message: 'Error al guardar deposito.'});
                if (!depositoStored) return res.status(404).send({message: 'No se ha podido guardar deposito.'});

                depositoStored.populate('pagos', function(err, deposito) {
                    // Do something
                    return res.status(200).send({
                        deposito: deposito,
                        message: 'Deposito creado correctamente',
                        status: true
                    });
                })

            });
        } catch (error) {
            console.log('err' + error);
            res.status(500).send(error);
        }
    },
    
    getDepositos: function(req, res) {

        Deposito.find({inactivar: false}).populate({ path: 'pagos'})
        .exec((err, depositos) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!depositos) return res.status(404).send({message: 'No hay Depositos para mostrar.'});

			return res.status(200).send({
                depositos,
                status: true
			});
		})
    },
    
    deleteDeposito: function(req, res) {
		var depositoId = req.params.id;

		Deposito.findByIdAndRemove(depositoId, {new:true, useFindAndModify: false}, (err, depositoRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar el Deposito.'});

			if (!depositoRemove) return res.status(404).send({message: 'No se puede eliminar el deposito'});

			return res.status(200).send({
                deposito: depositoRemove,
                status: true
			});
		});
    },
    
    getDeposito: async(req, res) => {
        var id = req.params.id;
        try {
            if (id == null ) return res.status(404).send({message: 'El deposito no existe'});
            let deposito = await Deposito.findOne({ _id: id, inactivar: false })
            .populate({
                path: 'pagos',
                match: { inactivar: false }
            })

            return res.status(200).send({
                deposito
            });

        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    eliminarPagoFromDeposito: async(req, res) => {
        var deposito = req.body;
        try {
            let pagos = deposito.pagos;

            // SET Valores
            deposito.totalTotalPago = 0;
            deposito.totalGraduacion = 0;
            deposito.totalMantenimiento = 0;
            deposito.totalSeguridad = 0;
            deposito.totalTecnologia = 0;
            deposito.totalCuido = 0;
            deposito.totalMatricula = 0;
            deposito.totalDonativo = 0;
            deposito.totalMensualidad = 0;
            deposito.totalSeguro = 0;
            deposito.totalAnuario = 0;
            deposito.totalLibrosDigitales = 0;
            deposito.totalRecargos = 0;
            deposito.totalDeposito = 0;

            for (const pago of pagos) {
                if(pago.isDeleted) {
                    // Actualiza el codigoDeposito en cada pago seleccionado
                    await Pago.findByIdAndUpdate(pago._id, {$set:{codigoDeposito: null}}, {new:true, useFindAndModify: false});
                }
                deposito.totalTotalPago += pago.totalPago;
                deposito.totalDeposito += pago.totalPago;
                deposito.totalGraduacion += pago.montoGraduationFeePagado;
                deposito.totalDeposito += pago.montoGraduationFeePagado;
                deposito.totalMantenimiento += pago.montoMaintenanceFeePagado;
                deposito.totalDeposito += pago.montoMaintenanceFeePagado;
                deposito.totalSeguridad += pago.montoSecurityFeePagado;
                deposito.totalDeposito += pago.montoSecurityFeePagado;
                deposito.totalTecnologia += pago.montoTechnologyFeePagado;
                deposito.totalDeposito += pago.montoTechnologyFeePagado;
                deposito.totalCuido += pago.montoTotalCuidoPagado;
                deposito.totalDeposito += pago.montoTotalCuidoPagado;
                deposito.totalMatricula += pago.montoTotalMatriculaStudentsPagado;
                deposito.totalDeposito += pago.montoTotalMatriculaStudentsPagado;
                deposito.totalDonativo += pago.montoDonationFeePagado;
                deposito.totalDeposito += pago.montoDonationFeePagado;
                deposito.totalMensualidad += pago.montoTotalMensualidadGradoStudentsPagado;
                deposito.totalDeposito += pago.montoTotalMensualidadGradoStudentsPagado;
                deposito.totalSeguro += pago.montoTotalSeguroStudentsPagado;
                deposito.totalDeposito += pago.montoTotalSeguroStudentsPagado;
                deposito.totalAnuario += pago.montoYearbookPagado;
                deposito.totalDeposito += pago.montoYearbookPagado;
                deposito.totalLibrosDigitales += pago.montoLibrosDigitalesPagado;
                deposito.totalDeposito += pago.montoLibrosDigitalesPagado;
                deposito.totalRecargos += pago.montoRecargoPagado;
                deposito.totalDeposito += pago.montoRecargoPagado;
            }

            deposito.pagos = deposito.pagos.filter(pago => pago.isDeleted !== true);

            let dep = await Deposito.findByIdAndUpdate(deposito._id, deposito, {new:true, useFindAndModify: false}).populate({ path: 'pagos'});
            return res.status(200).send({
                deposito: dep,
                status: true
            });
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    updateDeposito: async(req, res) => {
		var depositoId = req.params.id;
        let deposito = req.body;
        try {

            let pagos = deposito.pagos;

            // SET Valores
            deposito.totalTotalPago = 0;
            deposito.totalGraduacion = 0;
            deposito.totalMantenimiento = 0;
            deposito.totalSeguridad = 0;
            deposito.totalTecnologia = 0;
            deposito.totalCuido = 0;
            deposito.totalMatricula = 0;
            deposito.totalDonativo = 0;
            deposito.totalMensualidad = 0;
            deposito.totalSeguro = 0;
            deposito.totalAnuario = 0;
            deposito.totalLibrosDigitales = 0;
            deposito.totalRecargos = 0;
            deposito.totalDeposito = 0;

            for (const pago of pagos) {
                // Actualiza el codigoDeposito en cada pago seleccionado
                await Pago.findByIdAndUpdate(pago._id, {$set:{codigoDeposito: deposito.numeroDeposito}}, {new:true, useFindAndModify: false});
                deposito.totalTotalPago += pago.totalPago;
                deposito.totalDeposito += pago.totalPago;
                deposito.totalGraduacion += pago.montoGraduationFeePagado;
                deposito.totalDeposito += pago.montoGraduationFeePagado;
                deposito.totalMantenimiento += pago.montoMaintenanceFeePagado;
                deposito.totalDeposito += pago.montoMaintenanceFeePagado;
                deposito.totalSeguridad += pago.montoSecurityFeePagado;
                deposito.totalDeposito += pago.montoSecurityFeePagado;
                deposito.totalTecnologia += pago.montoTechnologyFeePagado;
                deposito.totalDeposito += pago.montoTechnologyFeePagado;
                deposito.totalCuido += pago.montoTotalCuidoPagado;
                deposito.totalDeposito += pago.montoTotalCuidoPagado;
                deposito.totalMatricula += pago.montoTotalMatriculaStudentsPagado;
                deposito.totalDeposito += pago.montoTotalMatriculaStudentsPagado;
                deposito.totalDonativo += pago.montoDonationFeePagado;
                deposito.totalDeposito += pago.montoDonationFeePagado;
                deposito.totalMensualidad += pago.montoTotalMensualidadGradoStudentsPagado;
                deposito.totalDeposito += pago.montoTotalMensualidadGradoStudentsPagado;
                deposito.totalSeguro += pago.montoTotalSeguroStudentsPagado;
                deposito.totalDeposito += pago.montoTotalSeguroStudentsPagado;
                deposito.totalAnuario += pago.montoYearbookPagado;
                deposito.totalDeposito += pago.montoYearbookPagado;
                deposito.totalLibrosDigitales += pago.montoLibrosDigitalesPagado;
                deposito.totalDeposito += pago.montoLibrosDigitalesPagado;
                deposito.totalRecargos += pago.montoRecargoPagado;
                deposito.totalDeposito += pago.montoRecargoPagado;
            }
            // return;

            let dep = await Deposito.findByIdAndUpdate(depositoId, deposito, {new:true, useFindAndModify: false}).populate({ path: 'pagos'});
            return res.status(200).send({
                // dep: dep,
                status: true
            });
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }

		
	},
}

module.exports = controller;