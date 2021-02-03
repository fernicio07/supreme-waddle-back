
var DonationFee = require('../models/donation-fee');
/**
 * Metodo que permite crear donativo anual o futuro
 * @param {*} ultimoEstadoCuentaFamily 
 * @param {*} pagarDonationFee 
 * @param {*} family
 */
module.exports.crearDonativo = async function crearDonativo(pagarDonationFee, ultimoEstadoCuentaFamily, family) {
    let donationFees = await DonationFee.find({}, {"name": 1, "cost": 1});

    if(pagarDonationFee) {
        ultimoEstadoCuentaFamily.donationFee.push(new DonationFee(donationFees[0]))

        if(family.planPagoDonaciones === 1){
            ultimoEstadoCuentaFamily.donativoFuturo = 0;
            ultimoEstadoCuentaFamily.donativoAnual = donationFees[0].cost,
            ultimoEstadoCuentaFamily.totalMensualidadDonativo = donationFees[0].cost / 10;
        }
        if(family.planPagoDonaciones === 2) {
            ultimoEstadoCuentaFamily.donativoFuturo = donationFees[0].cost / 2;
            ultimoEstadoCuentaFamily.donativoAnual = donationFees[0].cost / 2;
            ultimoEstadoCuentaFamily.totalMensualidadDonativo = donationFees[0].cost / 20;
        }
        if(family.planPagoDonaciones === 5) {
            ultimoEstadoCuentaFamily.donativoFuturo = 0;
            ultimoEstadoCuentaFamily.donativoAnual = donationFees[0].cost;
            ultimoEstadoCuentaFamily.totalMensualidadDonativo = donationFees[0].cost;
        }
    } else {
        // Index en array para saber si ya se cobro donativo Anual
        let indexPagoDonativoAnual = family.estadoCuenta.map(cuenta => cuenta.donativoAnual > 0).indexOf(true);
        // Condicion para determinar si ya se pago Donativo anual y el plan de pagos es diferene al 2
        if(indexPagoDonativoAnual >= 0 && ultimoEstadoCuentaFamily.donationFee.length > 0 && family.planPagoDonaciones != 2) {
            ultimoEstadoCuentaFamily.donativoFuturo = 0;
            ultimoEstadoCuentaFamily.donativoAnual = 0;
            ultimoEstadoCuentaFamily.totalMensualidadDonativo = 0;
        } else {
            // Index de estudiante inactivo en la familia para calcular Donativos
            let indexStudent = family.students.map(s => s.inactivar).indexOf(true);

            // Crea el donativo futuro para estudiantes menores de 5 grado
            if(indexStudent < 0 && ultimoEstadoCuentaFamily.donationFee.length == 0) {
                ultimoEstadoCuentaFamily.donativoFuturo = donationFees[0].cost;
                ultimoEstadoCuentaFamily.donativoAnual = 0;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = 0;
            }

            // Setea los donativos por que ya se pago el donativo anual y el futuro, siempre y cuando sea planPagoDonaciones 2
            if(indexStudent < 0 && family.planPagoDonaciones === 2 && ultimoEstadoCuentaFamily.donationFee.length > 0 && ultimoEstadoCuentaFamily.donativoAnual > 0 && ultimoEstadoCuentaFamily.donativoFuturo == 0 ) {
                ultimoEstadoCuentaFamily.donativoFuturo = 0;
                ultimoEstadoCuentaFamily.donativoAnual = 0;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = 0;
            }

            // Genera el donativo anual para estudiantes despues de 5 grado
            if(indexStudent < 0 && family.planPagoDonaciones === 2 && ultimoEstadoCuentaFamily.donationFee.length > 0 && ultimoEstadoCuentaFamily.donativoAnual > 0 && ultimoEstadoCuentaFamily.donativoFuturo > 0 ) {
                console.log("**** GENERANDO DONATIVO ANUAL PARA ESTUDIANTE DESPUES DE GRADO 5 **")
                ultimoEstadoCuentaFamily.donativoFuturo = 0;
                ultimoEstadoCuentaFamily.donativoAnual = donationFees[0].cost / 2;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = donationFees[0].cost / 20;
            }

            if(indexStudent < 0 && ultimoEstadoCuentaFamily.donationFee.length > 0 && family.planPagoDonaciones === 1 || family.planPagoDonaciones === 5) {
                ultimoEstadoCuentaFamily.donativoFuturo = 0;
                ultimoEstadoCuentaFamily.donativoAnual = 0;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = 0;
            }

            if(indexStudent >= 0 && family.planPagoDonaciones === 2 && ultimoEstadoCuentaFamily.donationFee.length > 0 && ultimoEstadoCuentaFamily.donativoAnual > 0 && ultimoEstadoCuentaFamily.donativoFuturo == 0) {
                ultimoEstadoCuentaFamily.donativoFuturo = 0;
                ultimoEstadoCuentaFamily.donativoAnual = 0;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = 0;
            }

            if(indexStudent >= 0 && family.planPagoDonaciones === 2 && ultimoEstadoCuentaFamily.donationFee.length > 0 && ultimoEstadoCuentaFamily.donativoAnual > 0 && ultimoEstadoCuentaFamily.donativoFuturo > 0) {
                ultimoEstadoCuentaFamily.donativoFuturo = 0;
                ultimoEstadoCuentaFamily.donativoAnual = donationFees[0].cost / 2;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = donationFees[0].cost / 20;
            }            

            if(indexStudent >= 0 && family.planPagoDonaciones === 1) {
                ultimoEstadoCuentaFamily.donativoFuturo = 0;
                ultimoEstadoCuentaFamily.donativoAnual = 0;
                ultimoEstadoCuentaFamily.totalMensualidadDonativo = 0;
            }
        }
    }
    // Sumar donativo anual
    ultimoEstadoCuentaFamily.totalAnual += ultimoEstadoCuentaFamily.donativoAnual;
    return ultimoEstadoCuentaFamily;
}