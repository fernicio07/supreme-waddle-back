const express = require('express')
const router = express.Router()
//const User = require('../models/user')
const UserController = require('../controllers/user');
const FamilyController = require('../controllers/family');
const StudentController = require('../controllers/student');
const PriceGradeController = require('../controllers/price-grade');
const AdmissionFeeController = require('../controllers/admission-fee');
const DonationFeeController = require('../controllers/donation-fee');
const GraduationFeeController = require('../controllers/graduation-fee');
const ReportesController = require('../controllers/reportes');
const EstadoCuentaFamilyController = require('../controllers/estado-cuenta-family');
const DepositoController = require('../controllers/deposito');
const PagoController = require('../controllers/pago');
const StartAnioController = require('../controllers/start-anio');
const jwtHelper = require('../config/jwtHelper');

router.get('/', (req, res) => {
    res.send('From api route')
})

// User
router.post('/register', UserController.nuevoRegister);
// router.post('/login', UserController.login);
router.post('/authenticate', UserController.authenticate);
router.get('/userProfile', jwtHelper.verifyJwtToken, UserController.userProfile);
router.post('/validatePassword', jwtHelper.verifyJwtToken, UserController.validatePassword);

// Family
router.post('/saveFamily', jwtHelper.verifyJwtToken, FamilyController.saveFamily)
router.get('/family/:code?', jwtHelper.verifyJwtToken, FamilyController.getFamily);
router.get('/validateFamily/:code?', jwtHelper.verifyJwtToken, FamilyController.validateFamily);
router.get('/getNameParents/:code?', jwtHelper.verifyJwtToken, FamilyController.getNameParents);
router.get('/getFamilies', jwtHelper.verifyJwtToken, FamilyController.getFamilies);
router.get('/getTotalFamilias', jwtHelper.verifyJwtToken, FamilyController.getTotalFamilias);
router.get('/getFamiliesForTable', FamilyController.getFamiliesForTable);
router.put('/updateFamily/:id', jwtHelper.verifyJwtToken, FamilyController.updateFamily);
router.delete('/deleteFamily/:id', jwtHelper.verifyJwtToken, FamilyController.deleteFamily);
router.get('/getCodesFamily', jwtHelper.verifyJwtToken, FamilyController.getCodesFamily);
// router.get('/getFamiliasPayDonationFee', jwtHelper.verifyJwtToken, FamilyController.getFamiliasPayDonationFee);
router.get('/getFamilyFromCuenta/:code?', jwtHelper.verifyJwtToken, FamilyController.getFamilyFromCuenta);
router.get('/crearRecargoFamily', jwtHelper.verifyJwtToken, FamilyController.crearRecargoFamily);
router.get('/familiasActivasSinEstudiantesDeBaja', jwtHelper.verifyJwtToken, FamilyController.familiasActivasSinEstudiantesDeBaja);

// Price Grade
router.post('/save-priceGrade', jwtHelper.verifyJwtToken, PriceGradeController.savePriceGrade);
router.get('/priceGrade/:id?', jwtHelper.verifyJwtToken, PriceGradeController.getPriceGrade);
router.get('/priceGrades', jwtHelper.verifyJwtToken, PriceGradeController.getPriceGrades);
router.put('/updatePriceGrade/:id', jwtHelper.verifyJwtToken, PriceGradeController.updatePriceGrade);
router.delete('/deletePriceGrade/:id', jwtHelper.verifyJwtToken, PriceGradeController.deletePriceGrade);
router.get('/getTotalesAnio', jwtHelper.verifyJwtToken, PriceGradeController.getTotalesAnio);
router.post('/getTotalesPeriodo', jwtHelper.verifyJwtToken, PriceGradeController.getTotalesPeriodo);
router.get('/getDonativoAnualFuturo', jwtHelper.verifyJwtToken, PriceGradeController.getDonativoAnualFuturo);

// Admission Fee
router.post('/save-admissionFee', jwtHelper.verifyJwtToken, AdmissionFeeController.saveAdmissionFee);
router.get('/admissionFee/:id?', jwtHelper.verifyJwtToken, AdmissionFeeController.getAdmissionFee);
router.get('/admissionFees', jwtHelper.verifyJwtToken, AdmissionFeeController.getAdmissionFees);
router.put('/updateAdmissionFee/:id', jwtHelper.verifyJwtToken, AdmissionFeeController.updateAdmissionFee);
router.delete('/deleteAdmissionFee/:id', jwtHelper.verifyJwtToken, AdmissionFeeController.deleteAdmissionFee);
router.get('/agregarCantidadEstudiantes', jwtHelper.verifyJwtToken, AdmissionFeeController.agregarCantidadEstudiantes);
router.get('/agregarCantidadFamilias', jwtHelper.verifyJwtToken, AdmissionFeeController.agregarCantidadFamilias);

// Donation Fee
router.post('/save-donationFee', jwtHelper.verifyJwtToken, DonationFeeController.saveDonationFee);
router.get('/donationFee/:id?', jwtHelper.verifyJwtToken, DonationFeeController.getDonationFee);
router.get('/donationFees', jwtHelper.verifyJwtToken, DonationFeeController.getDonationFees);
router.put('/updateDonationFee/:id', jwtHelper.verifyJwtToken, DonationFeeController.updateDonationFee);
router.delete('/deleteDonationFee/:id', jwtHelper.verifyJwtToken, DonationFeeController.deleteDonationFee);
// Graduation Fee
router.post('/save-graduationFee', jwtHelper.verifyJwtToken, GraduationFeeController.saveGraduationFee);
router.get('/graduationFee/:id?', jwtHelper.verifyJwtToken, GraduationFeeController.getGraduationFee);
router.get('/graduationFees', jwtHelper.verifyJwtToken, GraduationFeeController.getGraduationFees);
router.put('/updateGraduationFee/:id', jwtHelper.verifyJwtToken, GraduationFeeController.updateGraduationFee);
router.delete('/deleteGraduationFee/:id', jwtHelper.verifyJwtToken, GraduationFeeController.deleteGraduationFee);
// Estado Cuenta Family
router.post('/save-estadoCuentaFamily', jwtHelper.verifyJwtToken, EstadoCuentaFamilyController.saveEstadoCuentaFamily);
router.get('/estadoCuentaFamily/:id?', jwtHelper.verifyJwtToken, EstadoCuentaFamilyController.getEstadoCuentaFamily);
router.get('/estadosCuentasFamily', jwtHelper.verifyJwtToken, EstadoCuentaFamilyController.getEstadosCuentasFamily);
router.put('/updateEstadoCuentaFamily/:id', jwtHelper.verifyJwtToken, EstadoCuentaFamilyController.updateEstadoCuentaFamily);
router.delete('/deleteEstadoCuentaFamily/:id', jwtHelper.verifyJwtToken, EstadoCuentaFamilyController.deleteEstadoCuentaFamily);
router.get('/addGraduacionEstadoCuenta', EstadoCuentaFamilyController.addGraduacionEstadoCuenta);

// Pagos
router.post('/save-pago', jwtHelper.verifyJwtToken, PagoController.savePago);
router.put('/update-pago/:id', jwtHelper.verifyJwtToken, PagoController.updatePago);
router.get('/getPagos', jwtHelper.verifyJwtToken, PagoController.getPagos);
router.get('/getPagosByTipoPago/:code?', jwtHelper.verifyJwtToken, PagoController.getPagosByTipoPago);
router.delete('/pago/:id', jwtHelper.verifyJwtToken, PagoController.deletePago);

// Reportes
router.post('/getReportStudentsForGrade', jwtHelper.verifyJwtToken, ReportesController.getReportStudentsForGrade);
router.post('/getReportTotalesAnio', jwtHelper.verifyJwtToken, ReportesController.getReportTotalesAnio);
router.post('/getReportTotalesPeriodo', jwtHelper.verifyJwtToken, ReportesController.getReportTotalesPeriodo);
router.post('/getReportDonativos', jwtHelper.verifyJwtToken, ReportesController.getReportDonativos);
router.post('/getReportDeposito', jwtHelper.verifyJwtToken, ReportesController.getReportDeposito);

// Students
router.post('/save-student', jwtHelper.verifyJwtToken, StudentController.saveStudent);
router.get('/getStudents', jwtHelper.verifyJwtToken, StudentController.getStudents);
router.get('/getStudentsInactivos', jwtHelper.verifyJwtToken, StudentController.getStudentsInactivos);
router.get('/getStudentsForGrade/:id?', jwtHelper.verifyJwtToken, StudentController.getStudentsForGrade);
router.get('/getStudentsByFilterGrade', jwtHelper.verifyJwtToken, StudentController.getStudentsByFilterGrade);
router.put('/updateStudent/:id', jwtHelper.verifyJwtToken, StudentController.updateStudent);
router.delete('/deleteStudent/:id', jwtHelper.verifyJwtToken, StudentController.deleteStudent);
router.put('/inactivarStudent/:id', jwtHelper.verifyJwtToken, StudentController.inactivarStudent);
router.get('/getLastNameStudents', jwtHelper.verifyJwtToken, StudentController.getLastNameStudents);

// start Anio
router.post('/saveStartAnio', StartAnioController.saveStartAnio);
router.get('/getStartAnios', jwtHelper.verifyJwtToken, StartAnioController.getStartAnios);
router.get('/startAnio', jwtHelper.verifyJwtToken, StartAnioController.startAnio);

// Deposito
router.post('/save-deposito', jwtHelper.verifyJwtToken, DepositoController.saveDeposito);
router.get('/getDepositos', jwtHelper.verifyJwtToken, DepositoController.getDepositos);
router.delete('/deposito/:id', jwtHelper.verifyJwtToken, DepositoController.deleteDeposito);
router.get('/deposito/:id?', jwtHelper.verifyJwtToken, DepositoController.getDeposito);
router.post('/eliminarPagoFromDeposito', jwtHelper.verifyJwtToken, DepositoController.eliminarPagoFromDeposito);
router.put('/updateDeposito/:id', jwtHelper.verifyJwtToken, DepositoController.updateDeposito);



module.exports = router