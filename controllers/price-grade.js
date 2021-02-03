'use strict'

var PriceGrade = require('../models/price-grade');
var Family = require('../models/family');
var controller = {

    savePriceGrade: function(req, res) {
		var priceGrade = new PriceGrade();

		var params = req.body;
		priceGrade.name = params.nameGrade;
		priceGrade.cost = params.costGrade;
		priceGrade.code = params.codeGrade;

		priceGrade.save((err, priceGradeStored) => {
			if (err) return res.status(500).send({message: 'Error al guardar el precio de grado.'});

			if (!priceGradeStored) return res.status(404).send({message: 'No se ha podido guardar el precio de grado.'});

			return res.status(200).send({priceGrade: priceGradeStored, message: 'Guardado exitosamente'});
		});
	},

	getPriceGrade: function(req, res) {
		var priceGradetId = req.params.id;

		if (priceGradetId == null ) return res.status(404).send({message: 'El precio de grado no existe'});

		PriceGrade.findById(priceGradetId, (err, priceGrade) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!priceGrade) return res.status(404).send({message: 'El precio de grado no existe'});

			return res.status(200).send({
				priceGrade
			});
		});
	},

	getPriceGrades: function(req, res) {
		PriceGrade.find().sort('-year').exec((err, priceGrades) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!priceGrades) return res.status(404).send({message: 'No hay precios de grados para mostrar.'});

			return res.status(200).send({
				priceGrades
			});
		})
	},

	updatePriceGrade: function(req, res) {
		var priceGradeId = req.params.id;
		var update = req.body;

		PriceGrade.findByIdAndUpdate(priceGradeId, update, {new:true, useFindAndModify: false}, (err, priceGradeUpdated) => {
			if (err) return res.status(500).send({message: 'Error al actualizar.'});

			if (!priceGradeUpdated) return res.status(404).send({message: 'No existe el precio de grado para actualizar.'});

			return res.status(200).send({
				priceGrades: priceGradeUpdated
			});
		});
	},

	deletePriceGrade: function(req, res) {
		var priceGradeId = req.params.id;

		PriceGrade.findByIdAndRemove(priceGradeId, (err, priceGradeRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar el precio de grado.'});

			if (!priceGradeRemove) return res.status(404).send({message: 'No se puede eliminar ese precio de grado'});

			return res.status(200).send({
				priceGrades: priceGradeRemove
			});
		});
	},

	/** */
	getTotalesAnio: async(req, res)  => {
		var totalMensualidadesAnio = 0;
		var totalDonativoAnio = 0;
		var totalGraduationFeeAnio = 0;
		var totalMatriculaAnio = 0;
		var sumaTodosTotales = 0;
		var totalCuotasEspecialesAnio = 0;
		Family.find({ inactivar: false }, {"estadoCuenta": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
		.populate({
			path: 'estadoCuenta',
			populate: { path: 'graduationFee' },
			select: 'totalAnualMensualidadGradoStudents yearbook maintenance security technology donativoAnual totalGraduationFee totalMatriculaStudents _id totalSeguroStudents',
			options: { sort: { _id: -1} },
			perDocumentLimit: 1,
			match: { inactivar: false }
		})
        .exec((err, lastEstadoCuentaFamily) => {

            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});
			if (!lastEstadoCuentaFamily) return res.status(404).send({message: 'No hay familia para mostrar.'});		

			lastEstadoCuentaFamily.forEach(element => {
				console.log('Estado de cuenta CPN');
				console.log(element);
								
				if(!isNaN(element.estadoCuenta[0].totalAnualMensualidadGradoStudents)) {
					totalMensualidadesAnio += element.estadoCuenta[0].totalAnualMensualidadGradoStudents;
				}
	
				if(element.estadoCuenta[0].donativoAnual > 0) {					
					totalDonativoAnio += element.estadoCuenta[0].donativoAnual;
				} else {
					totalDonativoAnio += 0;
				}
	
				// Obtener los GraduationFee de la familia y sumarlos
				if(element.estadoCuenta[0].totalGraduationFee > 0) {
					// const sumCostGraduationFee = element.estadoCuenta[0].graduationFee.length > 1 ? element.estadoCuenta[0].graduationFee.reduce((a, b) => ({ cost: a.cost + b.cost})) : element.estadoCuenta[0].graduationFee[0];
					// totalGraduationFeeAnio += sumCostGraduationFee.cost;
					totalGraduationFeeAnio += element.estadoCuenta[0].totalGraduationFee;
				} else {
					totalGraduationFeeAnio += 0;
				}
	
				// Obtener los AdmissionFee del estudiante
				if(!isNaN(element.estadoCuenta[0].totalMatriculaStudents)) {
					totalMatriculaAnio += element.estadoCuenta[0].totalMatriculaStudents;
				}
	
				// Suma Admission Fee Family
				totalCuotasEspecialesAnio += element.estadoCuenta[0].yearbook;
				totalCuotasEspecialesAnio += element.estadoCuenta[0].maintenance;
				totalCuotasEspecialesAnio += element.estadoCuenta[0].security;
				totalCuotasEspecialesAnio += element.estadoCuenta[0].technology;
				if(element.estadoCuenta[0].totalSeguroStudents) {
					totalCuotasEspecialesAnio += element.estadoCuenta[0].totalSeguroStudents;
				}
			})

			sumaTodosTotales += totalMensualidadesAnio;
			sumaTodosTotales += totalDonativoAnio;
			sumaTodosTotales += totalGraduationFeeAnio;
			sumaTodosTotales += totalMatriculaAnio;
			sumaTodosTotales += totalCuotasEspecialesAnio;

			return res.status(200).send([{
				//lastEstadoCuentaFamilias: lastEstadoCuentaFamilias,
				totalMensualidadesAnio: totalMensualidadesAnio,
				totalDonativoAnio: totalDonativoAnio,
				totalGraduationFeeAnio: totalGraduationFeeAnio,
				totalMatriculaAnio: totalMatriculaAnio,
				totalCuotasEspecialesAnio: totalCuotasEspecialesAnio,
				sumaTodosTotales: sumaTodosTotales
			}]);
		});
	},

	getTotalesPeriodo: function(req, res) {

		var params = req.body;

		Family.find({ inactivar: false }, null, {sort: {codigoFamilia: 1}})
        .populate({
			path: 'estadoCuenta',
			populate: {path: 'donationFee'},
			match: { inactivar: false }
		})
		.populate({
			path: 'estadoCuenta',
			populate: {path: 'graduationFee'},
			match: { 'fechaCreoPago' : { $gte: params.fromDateISO, $lte: params.toDateISO},  inactivar: false }
		})
        .exec((err, families) => {
			var lastEstadoCuentaFamilias = [];
			var totalPeriodo = {};
			var arrTotalPeriodo = [];
			var total = 0;
			
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!families) return res.status(404).send({message: 'No hay Familias para mostrar.'});
			

			families.forEach(element => {
				if(element.estadoCuenta.length > 0) {
					lastEstadoCuentaFamilias.push(element.estadoCuenta[element.estadoCuenta.length - 1]);
				}
			})

			if(lastEstadoCuentaFamilias.length > 0 && lastEstadoCuentaFamilias.length > 1){
				totalPeriodo['instruccion'] = lastEstadoCuentaFamilias.reduce((a, b) => (a.montoTotalAnualMensualidadGradoStudentsPagado + b.montoTotalAnualMensualidadGradoStudentsPagado));
				totalPeriodo['donativo'] = lastEstadoCuentaFamilias.reduce((a, b) =>  a.montoDonationFeePagado ? (a.montoDonationFeePagado + b.montoDonationFeePagado): 0);
            	totalPeriodo['graduacion'] = lastEstadoCuentaFamilias.reduce((a, b) => a.montoGraduationFeePagado ? (a.montoGraduationFeePagado + b.montoGraduationFeePagado): 0);
				totalPeriodo['matricula'] = lastEstadoCuentaFamilias.reduce((a, b) => (a.montoTotalAdmissionFeeStudentsPagado + b.montoTotalAdmissionFeeStudentsPagado));
				totalPeriodo['anuario'] = lastEstadoCuentaFamilias.reduce((a, b) => (a.montoYearbookPagado + b.montoYearbookPagado));
				totalPeriodo['mantenimiento'] = lastEstadoCuentaFamilias.reduce((a, b) => (a.montoMaintenanceFeePagado + b.montoMaintenanceFeePagado));
				totalPeriodo['seguridad'] = lastEstadoCuentaFamilias.reduce((a, b) => (a.montoSecurityFeePagado + b.montoSecurityFeePagado));
				//totalPeriodo['Seguro EST']
				totalPeriodo['tecnologia'] = lastEstadoCuentaFamilias.reduce((a, b) => (a.montoTechnologyFeePagado + b.montoTechnologyFeePagado));
				
			} 
			if(lastEstadoCuentaFamilias.length == 1) {
				totalPeriodo['instruccion'] = lastEstadoCuentaFamilias[0].montoTotalAnualMensualidadGradoStudentsPagado;
				totalPeriodo['donativo'] = lastEstadoCuentaFamilias[0].montoDonationFeePagado;
				totalPeriodo['graduacion'] = lastEstadoCuentaFamilias[0].montoGraduationFeePagado;
				totalPeriodo['matricula'] = lastEstadoCuentaFamilias[0].montoTotalAdmissionFeeStudentsPagado;
				totalPeriodo['anuario'] = lastEstadoCuentaFamilias[0].montoYearbookPagado;
				totalPeriodo['mantenimiento'] = lastEstadoCuentaFamilias[0].montoMaintenanceFeePagado;
				totalPeriodo['seguridad'] = lastEstadoCuentaFamilias[0].montoSecurityFeePagado;
				//totalPeriodo['Seguro EST']
				totalPeriodo['tecnologia'] = lastEstadoCuentaFamilias[0].montoTechnologyFeePagado;
			}

			if(Object.keys(totalPeriodo).length > 0) {				
				for (const key in totalPeriodo) {
					if (totalPeriodo.hasOwnProperty(key)) {
						const element = totalPeriodo[key];
						total += element;                
					}
				}
				totalPeriodo['total'] = total;
				arrTotalPeriodo.push(totalPeriodo)
			}
			return res.status(200).send({
				totalPeriodo: arrTotalPeriodo
			});

        })
	},
	getDonativoAnualFuturo: function(req, res) {
		Family.find({ inactivar: false }, {"codigoFamilia": 1, "estadoCuenta": 1, "students": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
		.populate({
			path: 'students',
			populate: {
				path: 'grade',
				select: 'name -_id'
			},
			select: 'name lastName -_id',
			match: { inactivar: false }
		})
		.populate({
			path: 'estadoCuenta',
			select: 'donativoFuturo donativoAnual _id',
			options: { sort: { _id: -1} },
			perDocumentLimit: 1,
			match: { inactivar: false }
		})
        .exec((err, family) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!family) return res.status(404).send({message: 'No hay familia para mostrar.'});

            return res.status(200).send(
                family
            );
        })
	}
}

module.exports = controller;