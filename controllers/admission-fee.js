'use strict'

var AdmissionFee = require('../models/admission-fee');
var Family = require('../models/family');
var Student = require('../models/student');
var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var PriceGrade = require('../models/price-grade');
var EstadoCuenta = require('../helper/estado-cuenta.js');


var controller = {

    saveAdmissionFee: function(req, res) {
		var admissionFee = new AdmissionFee();

		var params = req.body;
		admissionFee.name = params.nameAdmissionFee;
		admissionFee.cost = params.costAdmissionFee;
        admissionFee.category = params.categoryAdmissionFee;

		admissionFee.save((err, admissionFeeStored) => {
			if (err) return res.status(500).send({message: 'Error al guardar Admission Fee de grado.'});

			if (!admissionFeeStored) return res.status(404).send({message: 'No se ha podido guardar Admission Fee de grado.'});

			return res.status(200).send({admissionFee: admissionFeeStored, message: 'Guardado exitosamente'});
		});
	},

	getAdmissionFee: function(req, res) {
		var admissionFeetId = req.params.id;

		if (admissionFeetId == null ) return res.status(404).send({message: 'El Admission Fee no existe'});

		AdmissionFee.findById(admissionFeetId, (err, admissionFee) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!admissionFee) return res.status(404).send({message: 'El Admission Fee no existe'});

			return res.status(200).send({
				admissionFee
			});
		});
	},

	getAdmissionFees: function(req, res) {
        var objAdmissionFee = {
            student: [],
            family: []
        }
		AdmissionFee.find().exec((err, admissionFees) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!admissionFees) return res.status(404).send({message: 'No hay Admission Fee para mostrar.'});
            
            let categoryStudent = admissionFees.filter(a => a.category == 'Student');
            let categoryFamily = admissionFees.filter(a => a.category == 'Family');
            objAdmissionFee['student'] = categoryStudent;
            objAdmissionFee['family'] = categoryFamily;

			return res.status(200).send({
                objAdmissionFee,
                status: true
			});
		})
	},

	updateAdmissionFee: async(req, res) => {
		var admissionFeeId = req.params.id;
		var update = req.body;
		try {
			// Actualizar el admission fee
			await AdmissionFee.findByIdAndUpdate(admissionFeeId, update, {new:true, useFindAndModify: false});
			
			return res.status(200).send({
				status: true 
			});
		} catch (error) {
			console.log('error' + error);
            res.status(500).send(error);
		}

	},

	deleteAdmissionFee: function(req, res) {
		var admissionFeeId = req.params.id;

		AdmissionFee.findByIdAndRemove(admissionFeeId, (err, admissionFeeRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar el Admission Fee.'});

			if (!admissionFeeRemove) return res.status(404).send({message: 'No se puede eliminar ese Admission Fee'});

			return res.status(200).send({
				admissionFees: admissionFeeRemove
			});
		});
	},

	agregarCantidadEstudiantes: async(req, res) => {
		try {

			let admissionStudent = await AdmissionFee.find({"category": 'Student'}, {"_id": 0, "__v": 0});
			// Suma de MATRICULA estudiantes
			let valorMatriculaStudent = admissionStudent.filter(a => a.name.toLowerCase() == 'matrícula')[0].cost;	
			// Suma de SEGURO estudiantes
			let valorSeguroStudent = admissionStudent.filter(a => a.name.toLowerCase() == 'seguro')[0].cost;

			// SOLO estudiantes activas y de grado PP a 11mo grado
			let estudiantes = await PriceGrade.aggregate(
                [
					{ $match: { "code":{ $lte : 13 }   } },
					{ "$lookup": {
						from: "student",
						let: { idGrado: "$_id"},
						pipeline: [
							{ $match:
								{ $expr:
									{ $and:
										[
										   { $eq: ["$grade", "$$idGrado" ] },
										   { $eq: ["$inactivar", false ] }
										]
									}
								}
							}
						],
						as: "dato_estudiante"
					  }
					},
					{ $unwind : "$dato_estudiante" },
					{ $project: {
						"_id": 0,
						"dato_estudiante": 1,				
					}}
				]
			)
			
			for (const estudiante of estudiantes) {
				
				let datoEstudiante = estudiante.dato_estudiante;
				// console.log('Estudiantes antes de updated');
				// console.log('***********************-------------------***********');
				console.log(datoEstudiante);
				let updateFields = {
					$set: {
						admissionFeeStudent: admissionStudent,
						totalAdmissionFeeStudent: valorMatriculaStudent + valorSeguroStudent,
						matriculaStudent: valorMatriculaStudent,
						seguroStudent: valorSeguroStudent,
					}
				}
				// console.log("FIN ESTUDIANTES ANTES")
				// console.log('***********************-------------------***********');
				// Actualiza estudiante
				let estudiantesUpdated = await Student.findByIdAndUpdate(datoEstudiante._id, updateFields, {new:true, useFindAndModify: false});
				// console.log("Estudiantes actualizado");
				// console.log('***********************-------------------***********');
				// console.log(estudiantesUpdated);

				let totalAdmissionFeeStudents = +estudiantesUpdated.matriculaStudent + +estudiantesUpdated.seguroStudent;
				let totalMatriculaStudents = +estudiantesUpdated.matriculaStudent;
				let totalSeguroStudents = +estudiantesUpdated.seguroStudent;

				let estadoCuenta = await EstadoCuentaFamily.findOne({ codigoFamilia: estudiantesUpdated.codigoFamilia, inactivar: false });
				estadoCuenta.totalAdmissionFeeStudents = totalAdmissionFeeStudents;
				estadoCuenta.totalMatriculaStudents = totalMatriculaStudents;
				estadoCuenta.totalSeguroStudents = totalSeguroStudents;

				let estadoCuentaUpdated = await EstadoCuenta.setEstadoCuenta(estadoCuenta);

				// Actualiza el estado de cuenta
				await EstadoCuentaFamily.findByIdAndUpdate(estadoCuentaUpdated._id, estadoCuentaUpdated, {new:true, useFindAndModify: false});
			}

			return res.status(200).send({
				messagge: "Cantidades agregadas exitosamente",
				status: true
			});
		} catch (error) {
			console.log('error' + error);
            res.status(500).send(error);
		}
	},

	agregarCantidadFamilias: async(req, res) => {
		let familias = await Family.find({ inactivar: false }, {"students": 1, 'admisionFeeFamily': 1, "_id": 1}, {sort: {codigoFamilia: 1}})
		.populate({
			path: 'students',
			populate: {path: 'grade', select: 'code'},
			select: 'grade',
			match: { inactivar: false }
		})

		for (const family of familias) {
			let aplicarCantidades = false;

			if(family.students.length > 0) {
				// Recorrer los estudiantes de la familia XXX
				for (const student of family.students) {
					// Validamos que por lo menos tiene un estudiante menor a 12 grado
					if(student.grade.code < 14) {
						aplicarCantidades = true;
					}
				}
			}
			console.log(aplicarCantidades);
			if(aplicarCantidades) {
				let idFamily = family._id;
				// Obtenemos admission Fee para familia
				let admissionFamily = await AdmissionFee.find({"category": 'Family'}, {"_id": 0, "__v": 0});
				// Actualizamos AdmissionFee de la familia
				family.admisionFeeFamily = admissionFamily;
				let familiaUpdated = await Family.findByIdAndUpdate(idFamily, {$set: {admisionFeeFamily: admissionFamily}}, {new:true, useFindAndModify: false});
				// console.log("FAMILIA ACTUALIZADA CON ADDMISSION FEE")
				// console.log('***********************-------------------***********');
				// console.log(familiaUpdated);


				// Admission Fee
				let sumCostYearbook = familiaUpdated.admisionFeeFamily.filter(a => a.name.toLowerCase()== 'anuario')[0].cost;
				let sumCostMaintenanceFee = familiaUpdated.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'mantenimiento')[0].cost;
				let sumCostSecurityFee = familiaUpdated.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'seguridad')[0].cost;
				let sumCostTechnologyFee = familiaUpdated.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'tecnología')[0].cost;

				let estadoCuenta = await EstadoCuentaFamily.findOne({ codigoFamilia: familiaUpdated.codigoFamilia, inactivar: false });
				// console.log("ESTADO DE CUENTA ANTES UPDATE")
				// console.log('***********************-------------------***********');
				// console.log(estadoCuenta);

				estadoCuenta.yearbook = sumCostYearbook;
				estadoCuenta.maintenance = sumCostMaintenanceFee;
				estadoCuenta.security = sumCostSecurityFee;
				estadoCuenta.technology = sumCostTechnologyFee;

				let estadoCuentaUpdated = await EstadoCuenta.setEstadoCuenta(estadoCuenta);

				// console.log("ESTADO DE CUENTA DESPUES UPDATE")
				// console.log('***********************-------------------***********');
				// console.log(estadoCuentaUpdated);

				// Actualiza el estado de cuenta
				await EstadoCuentaFamily.findByIdAndUpdate(estadoCuentaUpdated._id, estadoCuentaUpdated, {new:true, useFindAndModify: false});

			}
		}

		return res.status(200).send({
			messagge: "Cantidades agregadas exitosamente",
			status: true
		});
	}
}

module.exports = controller;