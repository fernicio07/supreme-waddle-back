
// var DonationFee = require('../models/donation-fee');
/**
 * Metodo que permite crear donativo anual o futuro
 * @param {*} ultimoEstadoCuentaFamily 
 * @param {*} pagarDonationFee 
 * @param {*} family
 */
module.exports.setEstadoCuenta = async function setEstadoCuenta(ultimoEstadoCuentaFamily) {

    // SET totalAnual
    ultimoEstadoCuentaFamily.totalAnual = 0;

    // Sumar cantidades para totalAnual
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.totalMatriculaStudents;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.totalSeguroStudents;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.cuido;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.montoLibrosDigitales;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.totalAnualMensualidadGradoStudents;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.maintenance;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.security;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.technology;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.yearbook;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.recargo;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.donativoAnual;
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.donativoFuturo;
    
    return ultimoEstadoCuentaFamily;
}