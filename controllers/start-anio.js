'use strict'

var StartAnio = require('../models/start-anio');
var Family = require('../models/family');
var Student = require('../models/student');
var PriceGrade = require('../models/price-grade');
var AdmissionFee = require('../models/admission-fee');
var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var Pago = require('../models/pago');
var Dad = require('../models/dad');
var Mom = require('../models/mom');
var Guardian = require('../models/guardian');
var Deposito = require('../models/deposito');
var donativo = require('../helper/donativo.js');

var controller = {

    saveStartAnio: function(req, res) {
		var startAnio = new StartAnio();

        var params = req.body;
        startAnio.fromDateAnio = params.fromDateAnio;
        startAnio.toDateAnio = params.toDateAnio;
        
		startAnio.save((err, startAnioStored) => {
			if (err) return res.status(500).send({message: 'Error al guardar el año.'});

			if (!startAnioStored) return res.status(404).send({message: 'No se ha podido guardar el año.'});

			return res.status(200).send({
                startAnio: startAnioStored, 
                message: 'Año creado exitosamente',
                status: true
            });
		});
	},

	getStartAnios: function(req, res) {

		StartAnio.find().exec((err, startAnios) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!startAnios) return res.status(404).send({message: 'No hay años para mostrar.'});

			return res.status(200).send({
                startAnios,
                status: true
			});
		})
	},
    
    startAnio: async(req, res) => {
		var inactiVarFamilia = false;

		try {
			let familias = await Family.find({ inactivar: false }, null, {sort: {codigoFamilia: 1}})
			.populate({
				path: 'students',
                populate: {path: 'grade'},
                match: { inactivar: false }
			})
			.populate({path: 'dad'})
			.populate({path: 'mom'})
			.populate({path: 'guardian'})
			.populate({
				path: 'estadoCuenta',
                populate: {path: 'graduationFee'},
                match: { inactivar: false }
			})
			.populate({
				path: 'estadoCuenta',
                populate: {path: 'donationFee'},
                match: { inactivar: false }
            })
            .populate({
                path: 'pagos',
                match: { inactivar: false }
            })

            // SET los admission fee
            let admissionFee = await AdmissionFee.find();
            for (const admission of admissionFee) {
                console.log('***** SETEANDO LOS ADMISSION *****');
                await AdmissionFee.findByIdAndUpdate(admission._id, {$set:{cost: 0}}, {new:true, useFindAndModify: false});
            }
            console.log('** END SETT ADMISSION ***');

			for (const familia of familias) {
                // SET los estudiantes
                for (const student of familia.students) {
					if(student.grade.code == 14 && !student.inactivar) {
                        student.inactivar = true;
						// Actualizamos Atributo inactivar en estudiante por que ya termino escuela
						await Student.findByIdAndUpdate(student._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});
					} else if (!student.inactivar) {
                        
						let codigoGradoNuevo = student.grade.code + 1;
                        let gradoNuevo = await PriceGrade.findOne({ code: codigoGradoNuevo })                  
                        let instruccionStudent = gradoNuevo.cost;

                        // console.log("*** GRADO NUEVO ****")
                        // console.log(gradoNuevo);
                        // console.log("*** ENDDDD GRADO NUEVO ****")
                        student.grade = gradoNuevo;


						let admissionStudent = await AdmissionFee.find({"category": 'Student'}, {"_id": 0, "__v": 0});

                        // Suma de MATRICULA estudiantes
                        let valorMatriculaEstudiante = admissionStudent.filter(a => a.name.toLowerCase() == 'matrícula')[0].cost;
                        // Suma de SEGURO estudiantes
                        let valorSeguroEstudiante = admissionStudent.filter(a => a.name.toLowerCase() == 'seguro')[0].cost;

                        if(student.hijoMaestro) instruccionStudent = instruccionStudent / 2;
                        student.instruccionStudent = instruccionStudent;
                        student.instruccionAnualStudent = instruccionStudent * 10;

						let updateFields = {
							$set: {
								grade: new PriceGrade(gradoNuevo),
								instruccionStudent: instruccionStudent,
								matriculaStudent: valorMatriculaEstudiante,
								seguroStudent: valorSeguroEstudiante,
								instruccionAnualStudent: instruccionStudent * 10,
								meses: 10,
								totalAdmissionFeeStudent: valorMatriculaEstudiante + valorSeguroEstudiante
							}
						}
						await Student.findByIdAndUpdate(student._id, updateFields, {new:true, useFindAndModify: false});
					}                    
                }

                // SET/Inactivar estado de cuenta actual y crear uno nuevo
                familia.estadoCuenta[0].inactivar = true;
                let eCuenta = familia.estadoCuenta[0];
                await EstadoCuentaFamily.findByIdAndUpdate(eCuenta._id, {$set: {inactivar: true}}, {new:true, useFindAndModify: false});
                console.log('*** ESTADO DE CUENTA INACTIVO ****');

                // SET pagos de la familia
                for (const pago of familia.pagos) {
                    pago.inactivar = true;
                    await Pago.findByIdAndUpdate(pago._id, {$set: {inactivar: true}}, {new:true, useFindAndModify: false});
                }
                // familia.pagos.forEach(async pago => {
                //     pago.inactivar = true;
                //     await Pago.findByIdAndUpdate(pago._id, {$set: {inactivar: true}}, {new:true, useFindAndModify: false});
                // });
                console.log('*** PAGOS INACTIVADOS **');

                // SET Depositos
                let depositos = await Deposito.find({inactivar: false});
                console.log('**///*** DEPOSITOS **///**');
                console.log(depositos);
                console.log('**///*** ENDDD DEPOSITOS **///**');
                for (const deposito of depositos) {
                    deposito.inactivar = true;
                    await Deposito.findByIdAndUpdate(deposito._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});
                }
                // depositos.forEach(async deposito => {
                //     deposito.inactivar = true;
                //     await Deposito.findByIdAndUpdate(deposito._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});
                // });
                console.log('*** DEPOSITOS INACTIVADOS ***');

				// Bandera para inactivar familia si ya terminaron escuela todos estudiantes
				let indexStudent = familia.students.map(student => student.inactivar).indexOf(false);
				if(indexStudent < 0 ) inactiVarFamilia = true;

                // Inactivar toda la familia(Students, familia, dad, mom, guardian)
				if(inactiVarFamilia) {
					await Dad.findByIdAndUpdate(familia.dad._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});
					await Mom.findByIdAndUpdate(familia.mom._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});
                    if(familia.guardian) await Guardian.findByIdAndUpdate(familia.guardian._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});

					await Family.findByIdAndUpdate(familia._id, {$set:{inactivar: true}}, {new:true, useFindAndModify: false});
				} else {
                    // Se crea estado de cuenta y se agrega a la familia
                    let saveEstadoCuentaFamily = await crearEstadoCuenta(familia);
                    familia.estadoCuenta.push(saveEstadoCuentaFamily);

                    // SET el estado de cuenta de la familia con los valores de los estudiantes
                    await setEstadoCuentaFamilia(familia);;

                    await Family.findByIdAndUpdate(familia._id, {$set:{estadoCuenta: familia.estadoCuenta}}, {new:true, useFindAndModify: false});
                }
            }            
            return res.status(200).send({
                status: true
            });
		} catch (error) {
			console.log('error' + error);
            res.status(500).send(error);
		}
		
    }
}

/**
 * Metodo que permite crear un nuevo estado de cuenta para la familia
 * @param {Familia} family Familia
 */
async function crearEstadoCuenta(family) {
     // Estado de cuenta familia
     let total = 0;

     // Se crea el total de admission Fee para cada Familia
     total += family.admisionFeeFamily.reduce((a, b) => ({ cost: a.cost + b.cost }))['cost'];
 
     // Valores de Admission Fee Familia
     let valorYearbook = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'anuario')[0].cost;
     let valorMaintenance = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'mantenimiento')[0].cost;
     let valorSecurity = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'seguridad')[0].cost;
     let valorTechnology = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'tecnología')[0].cost;
 
     let estadoCuentafamily = new EstadoCuentaFamily({
         "codigoFamilia": family.codigoFamilia,
         "totalAnual": total,
         "cuido": 0,
         "yearbook": valorYearbook,
         "maintenance": valorMaintenance,
         "security": valorSecurity,
         "technology": valorTechnology,
         "donativoFuturo": 0,
         "donativoAnual": 0,
         "inactivar": false
     });
 
     let savedEstadoCuentaFamily = await estadoCuentafamily.save();
     return savedEstadoCuentaFamily;
}

/**
 * Metodo que permite SET el ultimo estado de cuenta de la familia con
 * los valores de los estudiantes
 * @param {Famia} family 
 */
async function setEstadoCuentaFamilia(family) {
    var total = 0;
    var pagarDonationFee = false;
    let sumaMensualidadGradoStudents = 0;
    let valorMatriculaEstudiantes = 0;
    let valorSeguroEstudiantes = 0;

    try {
        // Se crea el total de admission Fee para cada Estudiante
        for (let index = 0; index < family.students.length; index++) {
            const estudiante = family.students[index];
            if(!estudiante.inactivar) {
                // Suma de MENSUALIDAD estudiantes
                sumaMensualidadGradoStudents += estudiante.instruccionStudent;
                // Suma de MATRICULA estudiantes
                valorMatriculaEstudiantes += estudiante.matriculaStudent;
                // Suma de SEGURO estudiantes
                valorSeguroEstudiantes += estudiante.seguroStudent;
            }
        }
    
        total += valorMatriculaEstudiantes + valorSeguroEstudiantes;
        total += sumaMensualidadGradoStudents * 10;
    
        console.log(family.estadoCuenta);
        var ultimoEstadoCuentaFamily = family.estadoCuenta[family.estadoCuenta.length - 1];
        console.log('Ultimo estado cuenta familia')
        console.log(ultimoEstadoCuentaFamily);
        // Sumar al total los admission fee de la familia
        total += ultimoEstadoCuentaFamily.maintenance + ultimoEstadoCuentaFamily.security + ultimoEstadoCuentaFamily.technology + ultimoEstadoCuentaFamily.yearbook;

        if(ultimoEstadoCuentaFamily.recargo) total += ultimoEstadoCuentaFamily.recargo;
        if(ultimoEstadoCuentaFamily.cuido) total += ultimoEstadoCuentaFamily.cuido;
        
        ultimoEstadoCuentaFamily['totalAnual'] = total;
        ultimoEstadoCuentaFamily['totalMensualidadGradoStudents'] = sumaMensualidadGradoStudents;
        ultimoEstadoCuentaFamily['totalAnualMensualidadGradoStudents'] = sumaMensualidadGradoStudents * 10;
        ultimoEstadoCuentaFamily['totalMatriculaStudents'] = valorMatriculaEstudiantes;
        ultimoEstadoCuentaFamily['totalSeguroStudents'] = valorSeguroEstudiantes;
        ultimoEstadoCuentaFamily['totalAdmissionFeeStudents'] = valorMatriculaEstudiantes + valorSeguroEstudiantes;

        let mesesPendientesPagarMensualidad = [
            {code: 1, key: 7, name: 'Agosto'},
            {code: 2, key: 8, name: 'Septiembre'},
            {code: 3, key: 9, name: 'Octubre'},
            {code: 4, key: 10, name: 'Noviembre'},
            {code: 5, key: 11, name: 'Diciembre'},
            {code: 6, key: 0, name: 'Enero'},
            {code: 7, key: 1, name: 'Febrero'},
            {code: 8, key: 2, name: 'Marzo'},
            {code: 9, key: 3, name: 'Abril'},
            {code: 10, key: 4, name: 'Mayo'}
        ];
        ultimoEstadoCuentaFamily['mesesPendientesPagarMensualidad'] = mesesPendientesPagarMensualidad;
    
        // Recorrer estudiantes para saber si se debe agregar donation fee al estado de cuenta
        family.students.forEach(estudiante => {
            // Solo aplicara para estudiantes Activos
            if(!estudiante.inactivar) {
                if(estudiante.grade.code >= 7 && ultimoEstadoCuentaFamily.donationFee.length == 0) {
                    pagarDonationFee = true;
                }
            } else {
                pagarDonationFee = false;
            }
        })
    
        // Seccion para crear Donativo futuro o anual
        ultimoEstadoCuentaFamily = await donativo.crearDonativo(pagarDonationFee, ultimoEstadoCuentaFamily, family);

        let newEstadoCuentafamily = new EstadoCuentaFamily(ultimoEstadoCuentaFamily);
        await EstadoCuentaFamily.findByIdAndUpdate(newEstadoCuentafamily._id, newEstadoCuentafamily, {new:true, useFindAndModify: false});
        
    } catch (error) {
        console.log('error' + error);
        res.status(500).send(error);
    }
}

module.exports = controller;