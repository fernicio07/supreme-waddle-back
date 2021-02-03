'use strict'

var DonationFee = require('../models/donation-fee');
var controller = {

    saveDonationFee: function(req, res) {
		var donationFee = new DonationFee();

		var params = req.body;
		donationFee.name = params.nameDonationFee;
		donationFee.cost = params.costDonationFee;

		donationFee.save((err, donationFeeStored) => {
			if (err) return res.status(500).send({message: 'Error al guardar Donation Fee de grado.'});

			if (!donationFeeStored) return res.status(404).send({message: 'No se ha podido guardar Donation Fee de grado.'});

			return res.status(200).send({donationFee: donationFeeStored, message: 'Guardado exitosamente'});
		});
	},

	getDonationFee: function(req, res) {
		var donationFeetId = req.params.id;

		if (donationFeetId == null ) return res.status(404).send({message: 'El Donation Fee no existe'});

		DonationFee.findById(donationFeetId, (err, donationFee) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

			if (!donationFee) return res.status(404).send({message: 'El Donation Fee no existe'});

			return res.status(200).send({
				donationFee
			});
		});
	},

	getDonationFees: function(req, res) {

		DonationFee.find().exec((err, donationFees) => {
			if (err) return res.status(500).send({message: 'Error al devolver los datos.'});

            if (!donationFees) return res.status(404).send({message: 'No hay Donation Fee para mostrar.'});

			return res.status(200).send({
                donationFees,
                status: true
			});
		})
	},

	updateDonationFee: function(req, res) {
		var donationFeeId = req.params.id;
		var update = req.body;

		DonationFee.findByIdAndUpdate(donationFeeId, update, {new:true}, (err, donationFeeUpdated) => {
			if (err) return res.status(500).send({message: 'Error al actualizar.'});

			if (!donationFeeUpdated) return res.status(404).send({message: 'No existe el Donation Fee para actualizar.'});

			return res.status(200).send({
				donationFees: donationFeeUpdated
			});
		});
	},

	deleteDonationFee: function(req, res) {
		var donationFeeId = req.params.id;

		DonationFee.findByIdAndRemove(donationFeeId, (err, donationFeeRemove) => {
			if (err) return res.status(500).send({message: 'No se ha podido borrar el Donation Fee.'});

			if (!donationFeeRemove) return res.status(404).send({message: 'No se puede eliminar ese Donation Fee'});

			return res.status(200).send({
				donationFees: donationFeeRemove
			});
		});
	}
}

module.exports = controller;