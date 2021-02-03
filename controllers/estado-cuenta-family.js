'use strict'

var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var Student = require('../models/student');
var GraduationFee = require('../models/graduation-fee');
var Family = require('../models/family');

var controller = {

    saveEstadoCuentaFamily: function(req, res) {
		var estadoCuentaFamily = new EstadoCuentaFamily();

		var params = req.body;

		estadoCuentaFamily.save((err, estadoCuentaFamilyStored) => {
			if (err) return res.status(500).send({message: 'Error al guardar Estado de cuenta.'});

			if (!estadoCuentaFamilyStored) return res.status(404).send({message: 'No se ha podido guardar Estado de cuenta.'});

			return res.status(200).send({estadoCuentaFamily: estadoCuentaFamilyStored, message: 'Guardado exitosamente'});
		});
	},

	getEstadoCuentaFamily: function(req, res) {
		var estadoCuentaFamilyId = req.params.id;

		if (estadoCuentaFamilyId == null ) return res.status(404).send({message: 'El Estado de cuenta no existe'});

		EstadoCuentaFamily.findById(estadoCuentaFamilyId, (err, estadoCuentaFamily) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!estadoCuentaFamily) return res.status(404).send({message: 'El Estado de cuenta no existe'});

			return res.status(200).send({
				estadoCuentaFamily
			});
		});
	},

	getEstadosCuentasFamily: function(req, res) {

		EstadoCuentaFamily.find().exec((err, estadoCuentasFamily) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!estadoCuentasFamily) return res.status(404).send({message: 'No hay Estados de cuenta para mostrar.'});

			return res.status(200).send({
                estadoCuentasFamily,
                status: true
			});
		})
	},

	/** */
	updateEstadoCuentaFamily: async(req, res) => {
		var estadoCuentaFamilyId = req.params.id;
		var students = req.body.students;
		var cuentaFamily = req.body.estadoCuenta[0];
		try { 
			// Actualizamos informacion Estudiantes
			for (const estudiante of students) {
				var studentId = estudiante._id;
				var updateFields = {
					$set: {
						instruccionAnualStudent: estudiante.instruccionAnualStudent,
						meses: estudiante.meses,
						instruccionStudent: estudiante.instruccionStudent,
						matriculaStudent: estudiante.matriculaStudent,
						seguroStudent: estudiante.seguroStudent,
						graduationFee: estudiante.graduationFee,
						cuido: estudiante.cuidoStudent,
						librosDigitales: estudiante.librosDigitalesStudent
					}
				}	
				await Student.findByIdAndUpdate(studentId, updateFields, {new:true, useFindAndModify: false});
			}
			await EstadoCuentaFamily.findByIdAndUpdate(estadoCuentaFamilyId, cuentaFamily, {new:true, useFindAndModify: false});			
			return res.status(200).send({
				status: true,
				messagge: 'Cuenta actualizada correctamente'
			});

		} catch (error) {
			console.log('error' + error);
            res.status(500).send(error);
		}
		
	},

	deleteEstadoCuentaFamily: function(req, res) {
		var estadoCuentaFamilyId = req.params.id;

		EstadoCuentaFamily.findByIdAndRemove(estadoCuentaFamilyId, (err, estadoCuentaFamilyRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar el Estado de cuenta.'});

			if (!estadoCuentaFamilyRemove) return res.status(404).send({message: 'No se puede eliminar ese Estado de cuenta'});

			return res.status(200).send({
				estadoCuentaFamily: estadoCuentaFamilyRemove
			});
		});
	},

	addGraduacionEstadoCuenta: async(req, res) => {
		try {
			let graduationFees = await GraduationFee.find({}, {"name": 1, "cost": 1});
			let familias = await Family.find({inactivar: false}, {"estadoCuenta": 1, "students": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
			.populate({
				path: 'students',
				match: { inactivar: false },
				populate: {path: 'grade'},
				select: 'grade',
			})
			.populate({				
				path: 'estadoCuenta',
				select: 'totalAnual graduationFee montoGraduationFeePagado _id',
				options: { sort: { _id: -1} },
				perDocumentLimit: 1,
				match: { inactivar: false }
			})

			for (const familia of familias) {
				let graduationFee = [];
				let totalGraduationFee = 0;
				let montoGraduationFeePagado = 0;
				for (const estudiante of familia.students) {
					if(estudiante.grade.code == 2 || estudiante.grade.code == 10 || estudiante.grade.code == 14) {
						for (const grado of graduationFees) {
							await Student.findByIdAndUpdate(estudiante._id, {$set: {graduationFee: grado.cost}}, {new:true, useFindAndModify: false});
							totalGraduationFee += grado.cost;
						}

						graduationFee.push(new GraduationFee(graduationFees[0]));

						let total = familia.estadoCuenta[0].totalAnual;
						total += totalGraduationFee;

						if(familia.estadoCuenta[0].montoGraduationFeePagado) {
							montoGraduationFeePagado = familia.estadoCuenta[0].montoGraduationFeePagado
						}

						let estadoCuentaFamilyId = familia.estadoCuenta[0]._id;	
						let updateFieldsCuenta = {
							$set: {
								totalAnual: total,
								totalGraduationFee: totalGraduationFee,
								graduationFee: graduationFee,
								montoGraduationFeePagado: montoGraduationFeePagado
							}
						}
						await EstadoCuentaFamily.findByIdAndUpdate(estadoCuentaFamilyId, updateFieldsCuenta, {new:true, useFindAndModify: false})
					}
				}
			}

			res.status(200).send({
				status: true,
				familias: familias
			});

		} catch (error) {
			console.log('error' + error);
            res.status(500).send(error);
		}
	}
}

module.exports = controller;