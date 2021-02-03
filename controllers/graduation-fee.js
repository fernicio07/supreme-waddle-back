'use strict'

var GraduationFee = require('../models/graduation-fee');
var Family = require('../models/family');
var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var controller = {

    saveGraduationFee: function(req, res) {
		var graduationFee = new GraduationFee();

		var params = req.body;
		graduationFee.name = params.nameGraduationFee;
		graduationFee.cost = params.costGraduationFee;
		
		graduationFee.save((err, graduationFeeStored) => {
			if (err) return res.status(500).send({message: 'Error al guardar Graduation Fee de grado.'});

			if (!graduationFeeStored) return res.status(404).send({message: 'No se ha podido guardar Graduation Fee de grado.'});

			return res.status(200).send({graduationFee: graduationFeeStored, message: 'Guardado exitosamente'});
		});
	},

	getGraduationFee: function(req, res) {
		var graduationFeetId = req.params.id;

		if (graduationFeetId == null ) return res.status(404).send({message: 'El Graduation Fee no existe'});

		GraduationFee.findById(graduationFeetId, (err, graduationFee) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!graduationFee) return res.status(404).send({message: 'El Donation Fee no existe'});

			return res.status(200).send({
				graduationFee
			});
		});
	},

	getGraduationFees: function(req, res) {

		GraduationFee.find().exec((err, graduationFees) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!graduationFees) return res.status(404).send({message: 'No hay Graduation Fee para mostrar.'});

			return res.status(200).send({
                graduationFees,
                status: true
			});
		})
	},

	updateGraduationFee: async(req, res) => {
		var graduationFeeId = req.params.id;
		var update = req.body;
		try {
			// Actualizar el graduation fee
			await GraduationFee.findByIdAndUpdate(graduationFeeId, update, {new:true, useFindAndModify: false});

			// let families = await Family.find({ inactivar: false }, {"estadoCuenta": 1, "students": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
			// .populate({
			// 	path: 'students',
			// 	populate: {path: 'grade'},
			// 	select: 'grade',
			// 	match: { inactivar: false }
			// })
			// .populate({				
			// 	path: 'estadoCuenta',
			// 	select: 'totalAnual totalGraduationFee graduationFee yearbook maintenance security technology totalAnual totalAdmissionFeeStudents totalAnualMensualidadGradoStudents _id',
			// 	options: { sort: { _id: -1} },
			// 	perDocumentLimit: 1,
			// 	match: { inactivar: false }
			// })
			
			// for (const family of families) {
			// 	let total = 0;
			// 	let totalGraduationFee = 0;
			// 	let graduationFee = [];
			// 	if(family.students.length > 0) {
			// 		var graduationFees = await GraduationFee.find({}, {"name": 1, "cost": 1});
			// 		for (const student of family.students) {
			// 			if(student.grade.code == 2 || student.grade.code == 10 || student.grade.code == 14) {
			// 				pagarGraduationFee = true;
			// 				graduationFees.forEach(grado => {
			// 					totalGraduationFee += grado.cost;
			// 				})
			// 			} else {
			// 				totalGraduationFee = 0;
			// 			}
			// 		}					
			// 	}

			// 	if(pagarGraduationFee) {
			// 		graduationFee.push(new GraduationFee(graduationFees[0]));
			// 	}

			// 	// total += family.estadoCuenta[0].totalAnual;
			// 	total += totalGraduationFee;
			// 	// Se suma la instruccion
			// 	total += family.estadoCuenta[0].totalAnualMensualidadGradoStudents;
			// 	// Se suma los admission Fee Familia
			// 	total += family.estadoCuenta[0].yearbook;
			// 	total += family.estadoCuenta[0].maintenance;
			// 	total += family.estadoCuenta[0].security;
			// 	total += family.estadoCuenta[0].technology;
			// 	// Se suma los admission fee estudiantes
			// 	total += family.estadoCuenta[0].totalAdmissionFeeStudents;

			// 	let estadoCuentaFamilyId = family.estadoCuenta[0]._id;				
			// 	let updateFieldsCuenta = {
			// 		$set: {
			// 			totalAnual: total,
			// 			totalGraduationFee: totalGraduationFee,
			// 			graduationFee: graduationFee
			// 		}
			// 	}
			// 	await EstadoCuentaFamily.findByIdAndUpdate(estadoCuentaFamilyId, updateFieldsCuenta, {new:true, useFindAndModify: false})
			// }

			return res.status(200).send({
				status: true 
			});

		} catch (error) {
			console.log('error' + error);
            res.status(500).send(error);
		}
	},

	deleteGraduationFee: function(req, res) {
		var graduationFeeId = req.params.id;

		GraduationFee.findByIdAndRemove(graduationFeeId, (err, graduationFeeRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar el Graduation Fee.'});

			if (!graduationFeeRemove) return res.status(404).send({message: 'No se puede eliminar ese Graduation Fee'});

			return res.status(200).send({
				graduationFees: graduationFeeRemove
			});
		});
	}
}

module.exports = controller;