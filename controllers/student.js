'use strict'

var Student = require('../models/student');
var PriceGrade = require('../models/price-grade');
var DonationFee = require('../models/donation-fee');
var Family = require('../models/family');
var AdmissionFee = require('../models/admission-fee');
var Pago = require('../models/pago');
var GraduationFee = require('../models/graduation-fee');
var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var donativo = require('../helper/donativo.js');

var controller = {

    /** */
	saveStudent: async(req, res) => {
		var params = req.body;
        let familyCode = params.studentForm[0].codigoFamilia;
        
        try {

            // Crea los estudiantes
            await crearStudents(params);
            
            // Obtener estudiantes que pertenecen a la familia
            let estudiantesFamily = await Student.find({ codigoFamilia: familyCode });

            // Busca y actualiza la familia con los estudiantes
            await Family.findOneAndUpdate({codigoFamilia: familyCode}, {$set:{students: estudiantesFamily}}, {new:true, useFindAndModify: false});

            // Busca la familia y trae ciertos campos, el ultimo estado de cuenta
            Family.findOne({ codigoFamilia: familyCode }, {"codigoFamilia": 1, "students": 1, 'planPagoDonaciones': 1, "estadoCuenta": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
            .populate({
                path: 'students',
                populate: {path: 'grade'},
                match: { inactivar: false }
            })
            .populate({
                path: 'estadoCuenta',
                select: '-__v',
                options: { sort: { _id: -1} },
                perDocumentLimit: 1,
                match: { inactivar: false }
            })
            .exec(async (err, family) => {
                if (err) return res.status(500).send({message: 'Error al devolver los datos.'});
                if (!family) return res.status(404).send({message: 'La familia no existe'});

                // Se crea total anual que debe la familia
                let saveEstadoCuentaFamily = await setEstadoCuentaFamilia(family, false);

                return res.status(200).send({
                    saveEstadoCuentaFamily
                });
            })
            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
	},

    /** */
	getStudents: async(req, res) => {
        try {
            await Student.find({inactivar: false}, null, {sort: {codigoFamilia: 1}})
            .populate({path: 'grade'})
            .exec(async (err, students) => {
                
                students = await Promise.all(students.map(async student => {
                    let pagos = await Pago.find({inactivar: false, codigoFamilia: student.codigoFamilia}, null);
                    student = JSON.parse(JSON.stringify(student));
                    student['onArchivar'] = true;
                    if(pagos.length > 0) {
                        student['onEliminar'] = false;
                    } else {
                        student['onEliminar'] = true;
                        // student['onArchivar'] = false;
                    }
                    return student;
                }));

                return res.status(200).send({
                    students
                });
            })            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    /** */
	getStudentsInactivos: async(req, res) => {
        try {
            await Student.find({inactivar: true}, null, {sort: {codigoFamilia: 1}})
            .populate({path: 'grade'})
            .exec(async (err, students) => {
                return res.status(200).send({
                    students
                });
            })            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    /** */
	getStudentsByFilterGrade: async (req, res) => {
        try {
            Student.aggregate(
                [
                    { $group : {_id: "$grade", total: { $sum: 1 }} },
                    { $lookup: {from: 'priceGrade', localField: '_id', foreignField: '_id', as: 'grade_docs'} },
                    { $sort: {"grade_docs.code": 1 }},
                    { $project: {"_id": 0, "total": 1, "grade_docs.name": 1}}
                ]
            ).exec( function (err, results) {
                return res.status(200).send({
                    results
                });
            });            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },
    
    /** */
    getLastNameStudents: async(req, res) => {
        Student.find({ inactivar: false }, {"codigoFamilia": 1, "lastName": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
        .exec((err, lastnNameStudents) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!lastnNameStudents) return res.status(404).send({message: 'No hay estudiantes para mostrar.'});

            return res.status(200).send({
                lastnNameStudents
            });
        })
    },

	getStudentsForGrade: async(req, res) => {
		var gradeId = req.params.id;

		if (gradeId == null ) return res.status(404).send({message: 'La familia no existe'});
		
		Student.find({ "grade": gradeId, inactivar: false}, {"name": 1, "lastName": 1, "codigoFamilia": 1, "_id": 0})
		.populate({path: 'grade'})
		.exec((err, students) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!students) return res.status(404).send({message: 'No hay estudiantes de la familia para mostrar.'});

			return res.status(200).send({
				students
			});
        })
	},

    /** */
	updateStudent: async (req, res) => {
		var studentId = req.params.id;
        var estudiante = req.body;
        try {
            // Crear mensualidad si es hijo de maestro paga mitad, si no es, paga completo
            // if(estudiante.hijoMaestro) {
            //     estudiante.instruccionStudent = estudiante.grade.cost / 2;
            // } else {
            //     estudiante.instruccionStudent = estudiante.grade.cost;
            // }
            await Student.findByIdAndUpdate(studentId, estudiante, {new:true, useFindAndModify: false});
            
            // Busca la familia y trae ciertos campos, el ultimo estado de cuenta
            Family.findOne({ codigoFamilia: estudiante.codigoFamilia }, {"codigoFamilia": 1, "students": 1, 'planPagoDonaciones': 1, "estadoCuenta": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
            .populate({
                path: 'students',
                populate: {path: 'grade'},
                match: { inactivar: false }
            })
            .populate({
                path: 'estadoCuenta',
                select: '-__v',
                options: { sort: { _id: -1} },
                perDocumentLimit: 1,
                match: { inactivar: false }
            })
            .exec(async (err, family) => {
                // Se actualiza estado de cuenta de la familia
                await setEstadoCuentaFamilia(family);
    
                return res.status(200).send({
                    status: true
                });
            })
            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }

	},

    /** */
	deleteStudent: async(req, res) => {
        var studentId = req.params.id;
        
        try {
            let datosStudent = await Student.findById(studentId, {"codigoFamilia": 1})
            await Student.findByIdAndRemove(studentId, {useFindAndModify: false});
    
            // Busca la familia y trae ciertos campos, el ultimo estado de cuenta
            Family.findOne({ codigoFamilia: datosStudent.codigoFamilia }, {"codigoFamilia": 1, "students": 1, 'planPagoDonaciones': 1, "estadoCuenta": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
            .populate({
                path: 'students',
                populate: {path: 'grade'},
                match: { inactivar: false }
            })
            .populate({
                path: 'estadoCuenta',
                select: '-__v',
                options: { sort: { _id: -1} },
                perDocumentLimit: 1,
                match: { inactivar: false }
            })
            .exec(async (err, family) => {    
                // Se actualiza estado cuenta de la familia
                await setEstadoCuentaFamilia(family);
    
                return res.status(200).send({
                    status: true
                });
            })            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }

    },

    /** */
    inactivarStudent: async(req, res) => {

        var studentId = req.params.id;
        var estudiante = req.body;
        
        try {
            await Student.findByIdAndUpdate(studentId, {$set:{inactivar: estudiante.archivar}}, {new:true, useFindAndModify: false});
            return res.status(200).send({
                status: true,
                messagge: 'Estudiante inactivado'
            })            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    }
}

// Funcion que permite crear en la DB los estudiantes 
// y retornar Array de estudiantes creados
async function crearStudents(params) {
    let admissionStudent = await AdmissionFee.find({"category": 'Student'}, {"_id": 0, "__v": 0});
    const valorAdmissionFee = admissionStudent.reduce((sum, value) => (typeof value.cost == "number" ? sum + value.cost : sum), 0);

    // Suma de MATRICULA estudiantes
    // let valorMatriculaEstudiante = admissionStudent.filter(a => a.name.toLowerCase() == 'admission')[0].cost;
    // Suma de SEGURO estudiantes
    // let valorSeguroEstudiante = admissionStudent.filter(a => a.name.toLowerCase() == 'insurance')[0].cost;

    for (const estudiante of params.studentForm) {
        var gradeDB = await PriceGrade.find({"_id": estudiante.gradeStudent}, {});

        // Crear mensualidad si es hijo de maestro paga mitad, si no es, paga completo
        // if(estudiante.hijoMaestroStudent) {
        //     estudiante.instruccionStudent = (gradeDB[0].cost / 2);
        // } else {
        //     estudiante.instruccionStudent = gradeDB[0].cost;
        // }

        const student = new Student({
            "codigoFamilia": estudiante.codigoFamilia,
            "grade": new PriceGrade({
                "_id": estudiante.gradeStudent,
                "name": gradeDB[0].name,
                "cost": gradeDB[0].cost,
                "code": gradeDB[0].code
            }),
            "name": estudiante.nameStudent,
            "lastName": estudiante.lastNameStudent,
            "birthdayDate": estudiante.birthdayDateStudent,
            "birthdayPlace": estudiante.birthdayPlaceStudent,
            "ciudadania": estudiante.ciudadaniaStudent,
            "livewith": estudiante.livewithStudent,
            "insuranceSocial": estudiante.insuranceSocialStudent,
            "admissionFeeStudent": admissionStudent,
            "totalAdmissionFeeStudent": valorAdmissionFee,
            "hijoMaestro": estudiante.hijoMaestroStudent,
            "vuelveAnioProximo": null,
            "instruccionStudent": estudiante.instruccionMensualStudent,
            "matriculaStudent": estudiante.matriculaStudent,
            "seguroStudent": estudiante.seguroStudent,
            "instruccionAnualStudent": estudiante.instruccionAnualStudent,
            "meses": estudiante.meses,
            "inactivar": false,
            "graduationFee": 0,
            "cuido": estudiante.cuidoStudent,
            "librosDigitales": estudiante.librosDigitalesStudent,
        })
        await student.save();
    }
}

/**
 * Metodo que permite crear o actualizar estado de cuenta
 * @param {*} family Familia
 * @param {*} crearEstadoCuenta Bandera para determinar si se crea un estado de cuenta
 */
async function setEstadoCuentaFamilia(family, crearEstadoCuenta) {
    var total = 0;
    var pagarDonationFee = false;    
    let totalMensualidadGradoStudents = 0;
    let sumaAnualGradoStudents = 0;
    let valorMatriculaEstudiantes = 0;
    let valorSeguroEstudiantes = 0;
    let valorGraduacion = 0;
    let valorCuido = 0;
    let valorLibrosDigitales = 0;

    try {
        // Se crea el total de admission Fee para cada Estudiante
        for (let index = 0; index < family.students.length; index++) {
            const estudiante = family.students[index];
            if(!estudiante.inactivar) {
                // Suma de MENSUALIDAD estudiantes
                // let sumaMensualidadGradoStudents = +estudiante.instruccionStudent;
                totalMensualidadGradoStudents += +estudiante.instruccionStudent;
                // Suma de ANUAL grado estudiantes
                sumaAnualGradoStudents += +estudiante.instruccionAnualStudent;
                // Suma de MATRICULA estudiantes
                valorMatriculaEstudiantes += +estudiante.matriculaStudent;
                // Suma de SEGURO estudiantes
                valorSeguroEstudiantes += +estudiante.seguroStudent;
                // suma de GRADUACION ESTUDIANTE
                valorGraduacion += +estudiante.graduationFee;
                // Suma cuido ESTUDIANTE
                valorCuido += +estudiante.cuido;
                // Suma LibrosDigitales ESTUDIANTE
                valorLibrosDigitales += +estudiante.librosDigitales;
            }
        }
    
        total += valorMatriculaEstudiantes + valorSeguroEstudiantes + valorCuido + valorLibrosDigitales;
        total += sumaAnualGradoStudents;
    
        var ultimoEstadoCuentaFamily = family.estadoCuenta[family.estadoCuenta.length - 1];
        // Sumar al total los admission fee de la familia
        total += ultimoEstadoCuentaFamily.maintenance + ultimoEstadoCuentaFamily.security + ultimoEstadoCuentaFamily.technology + ultimoEstadoCuentaFamily.yearbook + ultimoEstadoCuentaFamily.recargo + ultimoEstadoCuentaFamily.donativoAnual + ultimoEstadoCuentaFamily.donativoFuturo;

        // if(ultimoEstadoCuentaFamily.recargo) total += ultimoEstadoCuentaFamily.recargo;
        // if(ultimoEstadoCuentaFamily.cuido) total += ultimoEstadoCuentaFamily.cuido;
        ultimoEstadoCuentaFamily['cuido'] = valorCuido;
        ultimoEstadoCuentaFamily['montoLibrosDigitales'] = valorLibrosDigitales;

        ultimoEstadoCuentaFamily['totalAnual'] = total;
        ultimoEstadoCuentaFamily['totalMensualidadGradoStudents'] = totalMensualidadGradoStudents;
        ultimoEstadoCuentaFamily['totalAnualMensualidadGradoStudents'] = sumaAnualGradoStudents;
        ultimoEstadoCuentaFamily['totalMatriculaStudents'] = valorMatriculaEstudiantes;
        ultimoEstadoCuentaFamily['totalSeguroStudents'] = valorSeguroEstudiantes;
        ultimoEstadoCuentaFamily['totalAdmissionFeeStudents'] = valorMatriculaEstudiantes + valorSeguroEstudiantes;
        ultimoEstadoCuentaFamily['totalGraduationFee'] = valorGraduacion;

        /*let mesesPendientesPagarMensualidad = [
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
        ultimoEstadoCuentaFamily['mesesPendientesPagarMensualidad'] = mesesPendientesPagarMensualidad;*/
    
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
        // ultimoEstadoCuentaFamily = await donativo.crearDonativo(pagarDonationFee, ultimoEstadoCuentaFamily, family);
    
        // if (crearEstadoCuenta) {
        //     var objEstadoCuenta =  JSON.parse(JSON.stringify(ultimoEstadoCuentaFamily));
        //     delete objEstadoCuenta.__v;
        //     delete objEstadoCuenta._id;
        //     let estadoCuentafamily = new EstadoCuentaFamily(objEstadoCuenta);
    
        //     updateEstadoCuentaFamily = await estadoCuentafamily.save();
        // } 
        let newEstadoCuentafamily = new EstadoCuentaFamily(ultimoEstadoCuentaFamily);

        let updateEstadoCuentaFamily = await EstadoCuentaFamily.findByIdAndUpdate(newEstadoCuentafamily._id, newEstadoCuentafamily, {new:true, useFindAndModify: false});    
        return updateEstadoCuentaFamily;
        
    } catch (error) {
        console.log('error' + error);
        res.status(500).send(error);
    }
}

module.exports = controller;