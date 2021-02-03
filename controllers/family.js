'use strict'

//  Va ser una especie de clase que va tener una serie de metodos o acciones 
// que va poder hacer con la entidad de Family

var Family = require('../models/family');
var Student = require('../models/student');
var Dad = require('../models/dad');
var Mom = require('../models/mom');
var Guardian = require('../models/guardian');
var PriceGrade = require('../models/price-grade');
var AdmissionFee = require('../models/admission-fee');
var DonationFee = require('../models/donation-fee');
var GraduationFee = require('../models/graduation-fee');
var EstadoCuentaFamily = require('../models/estado-cuenta-family');
var donativo = require('../helper/donativo.js');

var controller = {

    /** */
    saveFamily: async(req, res)  => {
        var family = new Family();
        var params = req.body;
        try {

            let dadCreated = await crearDad(params);
            let momCreated = await crearMom(params);

            if(params.addFormGuardian) {
                let guardianCreated = await crearGuardian(params);
                family.guardian = guardianCreated;
            }
            family.addFormGuardian = params.addFormGuardian;
            family.codigoFamilia = params.codigoFamilia;
            family.students = [];
            family.pagos = [];
            family.dad = dadCreated;
            family.mom = momCreated;
            family.pagoAutomatico = params.pagoAutomatico;
            family.tipoTarjeta = params.tipoTarjeta;
            family.planPagoDonaciones = params.planPagoDonaciones;
            family.distribuirTotal = params.distribuirTotal;
            family.cuantoPagaInstruccion = params.cuantoPagaInstruccion;
            family.cuantoPagaDonativo = params.cuantoPagaDonativo;
            family.cuantoPagaCuido = params.cuantoPagaCuido;
            family.inactivar = false;
            // family.billingAddress = params.billingAddress;
            // family.circularAddress = params.circularAddress;
            family.addressFacturacionLineOne = params.addressFacturacionLineOne;
            family.addressFacturacionLineTwo = params.addressFacturacionLineTwo;
            family.addressFacturacionCity = params.addressFacturacionCity;
            family.addressFacturacionCountry = params.addressFacturacionCountry;
            family.facturacionZipCode = params.facturacionZipCode;
            family.addressCircularLineOne = params.addressCircularLineOne;
            family.addressCircularLineTwo = params.addressCircularLineTwo;
            family.addressCircularCity = params.addressCircularCity;
            family.addressCircularCountry = params.addressCircularCountry;
            family.circularZipCode = params.circularZipCode;            
            // Obtenemos admission Fee para familia            
            family.admisionFeeFamily = await AdmissionFee.find({"category": 'Family'}, {"_id": 0, "__v": 0});;

            // Se crea el estado de cuenta para la familia que devuelve un objecto
            family.estadoCuenta = [await crearEstadoCuenta(family, params.fromDateAnio, params.toDateAnio, params.donativoAnual, params.donativoFuturo)];

            family.save((err, familyStored) => {
                if (err) return res.status(500).send({message: 'Error al guardar la fimilia.'});
                if (!familyStored) return res.status(404).send({message: 'No se ha podido guardar la familia.'});
                return res.status(200).send({family: familyStored, message: 'Familia creada exitosamente'});
            });
        } 
        catch (err) {
            console.log('err' + err);
            res.status(500).send(err);
        }       
    },

    /** */
    getFamily: function(req, res) {
		var familyCode = req.params.code;

		if (familyCode == null ) return res.status(404).send({message: 'La familia no existe'});

        Family.findOne({ codigoFamilia: familyCode, inactivar: false })
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
        .exec((err, family) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!family) return res.status(404).send({message: 'La familia no existe'});

            return res.status(200).send({
                family
            });
        })
    },

    /** */
    validateFamily: async(req, res) => {
		var familyCode = req.params.code;

        let familia = await Family.findOne({ codigoFamilia: familyCode, inactivar: false }, {"codigoFamilia": 1});

        if(familia == null) return res.status(200).send({ existeFamiliaByCode: false });

        return res.status(200).send({ existeFamiliaByCode: true });
    },

    /** */
    getNameParents: async(req, res) => {
		var familyCode = req.params.code;

        Family.findOne({ codigoFamilia: familyCode, inactivar: false }, {"dad": 1, "mom": 1})
        .populate({
            path: 'dad',
            select: 'name lastName -_id'
        })
        .populate({
            path: 'mom',
            select: 'name lastName -_id'
        }).exec((err, parents) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!parents) return res.status(404).send({message: 'La familia no existe'});

            return res.status(200).send({
                parents
            });
        })
    },

    /** */
    getFamilyFromCuenta: function(req, res) {
        var familyCode = req.params.code;
		if (familyCode == null ) return res.status(404).send({message: 'La familia no existe'});

        Family.findOne({ codigoFamilia: familyCode, inactivar: false }, {"codigoFamilia": 1, "estadoCuenta": 1, "students": 1, "mom": 1, "dad": 1, "planPagoDonaciones": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
        .populate({
			path: 'students',
			populate: {
				path: 'grade',
				select: 'name -_id'
            },
            select: 'name lastName instruccionAnualStudent meses instruccionStudent matriculaStudent seguroStudent graduationFee cuido librosDigitales',
            match: { inactivar: false }
		})
        .populate({
            path: 'dad',
            select: 'name lastName -_id'
        })
        .populate({
            path: 'mom',
            select: 'name lastName -_id'
        })
        .populate({
            path: 'estadoCuenta',
            populate: {path: 'graduationFee'},
            match: { inactivar: false }
        })
        .populate({
            path: 'estadoCuenta',
            populate: {
                path: 'donationFee',
                select: 'name cost'
            },
			select: '-__v',
            options: { sort: { _id: -1} },
            perDocumentLimit: 1		,
            match: { inactivar: false }	
		})
        .exec((err, family) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!family) return res.status(404).send({message: 'La familia no existe'});

            return res.status(200).send({
                family
            });
        })
    },

    /** */
    getFamilies: function(req, res) {
        Family.find({inactivar: false}, null, {sort: {codigoFamilia: 1}})
        .populate({
            path: 'pagos',
            match: { inactivar: false }
        })
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
        
        .exec((err, families) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!families) return res.status(404).send({message: 'No hay proyectos para mostrar.'});

            return res.status(200).send({
                families
            });
        })
    },

    getTotalFamilias: async(req, res) => {
        try {
            let familias = await Family.find();
            return res.status(200).send({
                totalFamilias: familias.length,
                status: true
            });
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    /** */
    getFamiliesForTable: async(req, res) => {
        Family.find({inactivar: false}, {"codigoFamilia": 1}, {sort: {codigoFamilia: 1}})
        .populate({
            path: 'students',
            match: { inactivar: false },
            select: 'name',
        })
        .populate({
            path: 'dad',
            select: 'name lastName',
        })
        .populate({
            path: 'mom',
            select: 'name lastName',
        })
        
        .exec((err, families) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!families) return res.status(404).send({message: 'No hay proyectos para mostrar.'});

            families = families.map(familia => {
                return {
                    _id: familia._id,
                    numeroStudent: familia.students.length,
                    codigoFamilia: familia.codigoFamilia,
                    nombrePadre: familia.dad.name,
                    apellidoPadre: familia.dad.lastName,
                    nombreMadre: familia.mom.name,
                    apellidoMadre: familia.mom.lastName
                }
            })

            return res.status(200).send({
                families
            });
        })
    },

    /** */
    updateFamily: async(req, res) => {
        var familyId = req.params.id;
        var family = req.body;
        var pagarDonationFee = false;
        try {
            let codigoFamilia = family.codigoFamilia;

            // Sección para actualizar codigos de familia en las cuentas
            for (const cuenta of family.estadoCuenta) {
                cuenta.codigoFamilia = codigoFamilia;
                await EstadoCuentaFamily.findByIdAndUpdate(cuenta._id, {$set: {codigoFamilia: codigoFamilia}}, {new:true, useFindAndModify: false});
            }

            // Donativo
            // if(family.students.length > 0) {
            //      // Seccion para saber si paga donativo
            //     family.students.forEach(student => {
            //         if(student.grade.code >= 7) {
            //             pagarDonationFee = true;
            //         }
            //     })

            //     let ultimoEstadoCuentaFamily = family.estadoCuenta[family.estadoCuenta.length - 1];
            //     ultimoEstadoCuentaFamily = await donativo.crearDonativo(pagarDonationFee, ultimoEstadoCuentaFamily, family);
            //     await EstadoCuentaFamily.findByIdAndUpdate(ultimoEstadoCuentaFamily._id, ultimoEstadoCuentaFamily, {new:true, useFindAndModify: false});
            // }

            family.dad.codigoFamilia = codigoFamilia;
            await Dad.findByIdAndUpdate(family.dad._id, family.dad, {new:true, useFindAndModify: false})

            family.mom.codigoFamilia = codigoFamilia;
            await Mom.findByIdAndUpdate(family.mom._id, family.mom, {new:true, useFindAndModify: false})

            if(family.guardian) {
                family.guardian.codigoFamilia = codigoFamilia;
                await Guardian.findByIdAndUpdate(family.guardian._id, family.guardian, {new:true, useFindAndModify: false})
            }
            
            await Family.findByIdAndUpdate(familyId, family, {new:true, useFindAndModify: false})
            return res.status(200).send({
                messagge: 'Familia actualizada correctamente',
                status: true
            });
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    /** */
    getCodesFamily: function(req, res) {
        Family.find({ inactivar: false }, {"codigoFamilia": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
        .exec((err, codeFamily) => {
            if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!codeFamily) return res.status(404).send({message: 'No hay familia para mostrar.'});

            return res.status(200).send({
                codeFamily
            });
        })
    },

    crearRecargoFamily: async(req, res) => {
        let pagarRecargo = false;
        try {
            let familias = await Family.find({ inactivar: false }, {"estadoCuenta": 1, "pagos": 1, "_id": 1}, {sort: {codigoFamilia: 1}})
			.populate({
				path: 'estadoCuenta',
                options: { sort: { _id: -1} },
                perDocumentLimit: 1,
                match: { inactivar: false }
            })
            .populate({
                path: 'pagos',
                match: { inactivar: false }
            });
            
            for (const familia of familias) {
                let estadoCuenta = familia.estadoCuenta[0];
                // Crear recargo por no pagar mensualidad el mes
                pagarRecargo = await verificarSiPagaRecargo(estadoCuenta, familia.pagos);

                console.log('Familia debe pagar Recargo? : ' + pagarRecargo );
                if(pagarRecargo) {
                    estadoCuenta.recargo = 30;
                }
                // let listaRecargo = await crearRecargoPorMesVencido(estadoCuenta);
                // Crear Recargo por no pagar Donativo Mensual

                // Crear Recargo por no pagar Cuido mensual
                //let listaRecargo = [];

                // estadoCuenta.listaRecargo = [];
                // if(listaRecargo.length > 0) {
                //     estadoCuenta.recargo = listaRecargo.reduce((a, b) => ({ recargo: a.recargo + b.recargo }))['recargo'];
                // }
    
                let totalAnual = familia.estadoCuenta[0].totalAnual;
                totalAnual += estadoCuenta.recargo;
    
                let estadoCuentaFamilyId = familia.estadoCuenta[0]._id;
                let updateFieldsCuenta = {
                    $set: {
                        totalAnual: totalAnual,
                        recargo: estadoCuenta.recargo
                    }
                }
                await EstadoCuentaFamily.findByIdAndUpdate(estadoCuentaFamilyId, updateFieldsCuenta, {new:true, useFindAndModify: false})
            }
            return res.status(200).send({
                status: true,
                familias: familias
            });
            
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    },

    /** */
    deleteFamily: async(req, res) => {
        var familyId = req.params.id;

        let datosFamilia = await Family.findById(familyId, {"dad": 1, "mom": 1, "guardian": 1, "estadoCuenta": 1, "_id": 0})
        .populate({path: 'dad', select: '_id'})
        .populate({path: 'mom', select: '_id'})
        .populate({path: 'guardian', select: '_id'})
        .populate({
            path: 'estadoCuenta', 
            select: '_id',
            match: { inactivar: false }
        })

        // Eliminando estados de cuenta de la fmailia
        for (const estadoCuenta of datosFamilia.estadoCuenta) {
            await EstadoCuentaFamily.findByIdAndRemove(estadoCuenta._id, {useFindAndModify: false})
        }
        // datosFamilia.estadoCuenta.forEach(async estadoCuenta => {
        //     await EstadoCuentaFamily.findByIdAndRemove(estadoCuenta._id, {useFindAndModify: false})
        // })

        // Eliminando padre de la familia
        await Dad.findByIdAndRemove(datosFamilia.dad._id, {useFindAndModify: false});

        // Eliminando madre de la familia
        await Mom.findByIdAndRemove(datosFamilia.mom._id, {useFindAndModify: false});

        if(datosFamilia.guardian) await Guardian.findByIdAndRemove(datosFamilia.guardian._id);

		Family.findByIdAndRemove(familyId, {useFindAndModify: false}, (err, familyRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar la familia.'});

			if (!familyRemove) return res.status(404).send({message: 'No se puede eliminar la familia'});

			return res.status(200).send({
                status: true,
				family: familyRemove.codigoFamilia
			});
		});
    },

    familiasActivasSinEstudiantesDeBaja: async(req, res) => {
        try {

            // SOLO estudiantes activas y de grado PP a 11mo grado
			Family.find({inactivar: false}, {"codigoFamilia": 1, "_id": 0}, {sort: {codigoFamilia: 1}})
            .populate({
                path: 'students',
                select: 'inactivar',
            }).exec((err, families) => {
                if (err) return res.status(500).send({message: 'Error al devolver los datos.'});
                if (!families) return res.status(404).send({message: 'No hay proyectos para mostrar.'});

                let newFamilias = [];

                families.forEach(familia => {
                    let addFamilia = true;
                    for(const estudiante of familia.students){
                        if(estudiante.inactivar) {
                            addFamilia = false;
                            break
                        }
                    }
                    if(addFamilia) {
                        newFamilias.push(familia);
                    }
                })
                return res.status(200).send({
                    totalFamiliasActivas: newFamilias.length
                });
            })      
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    }
}

// Function que permite crear en la DB el padre y retornar
// el padre creado
async function crearDad(params) {
    const dad = new Dad({
        "codigoFamilia": params.codigoFamilia,
        "name": params.dadForm.nameDad,
        "lastName": params.dadForm.lastNameDad,
        "occupation": params.dadForm.occupationDad,
        "company": params.dadForm.companyDad,
        // "physicalAddress": params.dadForm.physicalAddressDad,
        // "mailingAddress": params.dadForm.mailingAddressDad,
        "homePhone": params.dadForm.homePhoneDad,
        "workPhone": params.dadForm.workPhoneDad,
        "mobilePhone": params.dadForm.mobilePhoneDad,
        "email": params.dadForm.emailDad,
        "hobby": params.dadForm.hobbyDad,
        "inactivar": false
    });
    let saveDad = await dad.save();
    return saveDad;
}

// Funcion que permite crear en la DB la madre y retornar
// la madre creada
async function crearMom(params) {
    const mom = new Mom({
        "codigoFamilia": params.codigoFamilia,
        "name": params.momForm.nameMom,
        "lastName": params.momForm.lastNameMom,
        "occupation": params.momForm.occupationMom,
        "company": params.momForm.companyMom,
        // "physicalAddress": params.momForm.physicalAddressMom,
        // "mailingAddress": params.momForm.mailingAddressMom,
        "homePhone": params.momForm.homePhoneMom,
        "workPhone": params.momForm.workPhoneMom,
        "mobilePhone": params.momForm.mobilePhoneMom,
        "email": params.momForm.emailMom,
        "hobby": params.momForm.hobbyMom,
        "exAlumna": params.momForm.exAlumnaMom,
        "yearStudy": params.momForm.yearStudyMom,
        "inactivar": false
    });
    let saveMom = await mom.save();
    return saveMom;
}

// Funcion que permite crear en la DB el guardian y retornar
// el guardian creado
async function crearGuardian(params) {
    const guardian = new Guardian({
        "codigoFamilia": params.codigoFamilia,
        "name":  params.guardianForm.nameGuardian,
        "lastName":  params.guardianForm.lastNameGuardian,
        "occupation":  params.guardianForm.occupationGuardian,
        "company":  params.guardianForm.companyGuardian,
        // "physicalAddress":  params.guardianForm.physicalAddressGuardian,
        // "mailingAddress":  params.guardianForm.mailingAddressGuardian,
        "homePhone":  params.guardianForm.homePhoneGuardian,
        "workPhone":  params.guardianForm.workPhoneGuardian,
        "mobilePhone":  params.guardianForm.mobilePhoneGuardian,
        "email":  params.guardianForm.emailGuardian,
        "hobby": params.guardianForm.hobbyGuardian,
        "inactivar": false
    });
    let saveGuardian = await guardian.save();
    return saveGuardian;
}

// Funcion que permite crear estado de cuenta para la familia
async function crearEstadoCuenta(family, fromDateAnio, toDateAnio, donativoAnual, donativoFuturo) {
    // let total = 0;
    let totalMensualidadDonativo = 0;

    // Se crea el total de admission Fee para cada Familia
    // total += family.admisionFeeFamily.reduce((a, b) => ({ cost: a.cost + b.cost }))['cost'];

    // Valores de Admission Fee Familia
    // let valorYearbook = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'yearbook')[0].cost;
    // let valorMaintenance = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'maintenance fee')[0].cost;
    // let valorSecurity = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'security fee')[0].cost;
    // let valorTechnology = family.admisionFeeFamily.filter(a => a.name.toLowerCase() == 'technology fee')[0].cost;

    // Crear totalMensualidadDonativo para el estado cuenta    
    if(family.planPagoDonaciones == 1 || family.planPagoDonaciones == 2) {
        // Divide entre 10
        totalMensualidadDonativo = donativoAnual / 10;
    } else {
        totalMensualidadDonativo = donativoAnual;
    }

    let mesesPendientesPagarMensualidad = [
        {code: 1, key: 7, name: 'Agosto', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 2, key: 8, name: 'Septiembre', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 3, key: 9, name: 'Octubre', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 4, key: 10, name: 'Noviembre', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 5, key: 11, name: 'Diciembre', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 6, key: 0, name: 'Enero', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 7, key: 1, name: 'Febrero', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 8, key: 2, name: 'Marzo', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 9, key: 3, name: 'Abril', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0},
        {code: 10, key: 4, name: 'Mayo', payPorcentaje: 0, payCuidoPorcentaje: 0, payDonationPorcentaje: 0}
    ];

    let month = new Date().getMonth();
    let indexMes = mesesPendientesPagarMensualidad.map(m => m.key).indexOf(month);
    if(indexMes >= 0) {
        // Elimina meses de la lista
        mesesPendientesPagarMensualidad = mesesPendientesPagarMensualidad.filter(mes => mes.code >= mesesPendientesPagarMensualidad[indexMes].code);
    }

    let estadoCuentafamily = new EstadoCuentaFamily({
        "codigoFamilia": family.codigoFamilia,
        "totalAnual": 0,
        "yearbook": 0,
        "maintenance": 0,
        "security": 0,
        "technology": 0,
        "inactivar": false,
        "fromDateAnio": fromDateAnio,
        "toDateAnio": toDateAnio,
        "donativoAnual": donativoAnual,
        "donativoFuturo": donativoFuturo,
        "recargo": 0,
        "totalMensualidadDonativo": totalMensualidadDonativo,
        "mesesPendientesPagarMensualidad": mesesPendientesPagarMensualidad
    });

    let savedEstadoCuentaFamily = await estadoCuentafamily.save();
    return savedEstadoCuentaFamily;
}

// Funcion que permite crear codigo de la familia
// function crearCodigoFamilia(codigoFamilia) {
//     var codigo = codigoFamilia;
//     var primeraLetra = codigo[0];
//     var numbers = codigo.slice(-3);
//     // Numero 100 to 999
//     if(+numbers[0]) {
//         var num = +numbers;
//         ++num;
//         return primeraLetra + numbers.slice(0, 0) + num;
//     }
//     // Numero 010 to 100
//     if(+numbers[1]) {
//         var num = +numbers.slice(-2);
//         ++num;
//         if(num > 99) {
//             return primeraLetra + numbers.slice(0, -3) + num;
//         } else {
//             return primeraLetra + numbers.slice(0, -2) + num;
//         }
//     }
//     // Numero 001
//     if(+numbers[2]) {
//         var num = +numbers.slice(-2);
//         ++num
//         if(num > 9) {
//             return primeraLetra + numbers.slice(0, -2) + num;
//         } else {
//             return primeraLetra + numbers.slice(0, -1) + num;
//         }
//     }

//     return primeraLetra + numbers.slice(0, -1) + 1;
// }

// async function crearRecargo(estadoCuenta) {
//     var months = [7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
//     // Verificar si el mes en el que estamos pertenece a uno del año escolar
//     var date = new Date();
//     var mesActual = date.getMonth();
//     var diaActual = date.getDate();
//     var anioActual = date.getFullYear();
//     // Thu Sep 10 2020 00:00:00 GMT-0500 (hora estándar de Colombia)
//     var fechaHoy = new Date(anioActual, mesActual, diaActual);
//     //var mesActual = fechaHoy.getMonth();
//     // var recargo = 0;
//     var listaRecargo = [];
//     if (months.indexOf(mesActual) >= 0) {
//         let pos = estadoCuenta.mesesPendientesPagarMensualidad.map(e => e.key).indexOf(mesActual);
//         // Estamos en el mes actual y la fecha supera limite
//         if (pos == 0 && fechaHoy.getDate() > 15) {
//             let a = {
//                 recargo: 30,
//                 mes: estadoCuenta.mesesPendientesPagarMensualidad[pos].name
//             }
//             listaRecargo.push(a);
//             return listaRecargo;
//         }
        
//         // 1 o meses atrazados
//         if (pos != 0) {
//             for (let index = 0; index <= pos; index++) {
//                 let a = {
//                     recargo: 30,
//                     mes: estadoCuenta.mesesPendientesPagarMensualidad[index].name
//                 };                        
//                 listaRecargo.push(a);
//             }
//             if (fechaHoy.getDate() <= 15) {
//                 listaRecargo.splice(pos, 1);                        
//                 return listaRecargo;
//             }
//             return listaRecargo;
//         }
//         return listaRecargo;
//     }
//     return listaRecargo;
// }

// async function crearRecargoPorMesVencido(estadoCuenta) {
//     var mesActual = new Date().getMonth();
//     var listaRecargo = [];
//     let pos = estadoCuenta.mesesPendientesPagarMensualidad.map(e => e.key).indexOf(mesActual);
//     if(pos >= 0) {
//         let a = {
//             recargo: 30,
//             mes: estadoCuenta.mesesPendientesPagarMensualidad[pos].name
//         }
//         listaRecargo.push(a);
//         return listaRecargo;
//     }
//     return listaRecargo;
// }

async function verificarSiPagaRecargo(estadoCuenta, pagos) {
    console.log('Verificando si la familia: ' + estadoCuenta.codigoFamilia + ' paga recargo');

    let mesActual = new Date().getMonth();
    let mesOfLista = estadoCuenta.mesesPendientesPagarMensualidad.filter(mes => mes.key === mesActual)[0];
    console.log("Mes de la lista");
    console.log(mesOfLista);

    console.log('Validando Porcentaje instruccion');
    if(mesOfLista.payPorcentaje != 100) return true;

    // console.log('Validando porcentaje de cuido');
    // if(estadoCuenta.cuido > 0 && mesOfLista.payCuidoPorcentaje != 100) return true;

    console.log('Validando porcentaje de Donativo')
    if(estadoCuenta.totalMensualidadDonativo > 0 && mesOfLista.payDonationPorcentaje != 100) return true;
    console.log('Termino de verificar');
    return false;
}

module.exports = controller;