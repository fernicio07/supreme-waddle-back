var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var studentSchema = new Schema({
	codigoFamilia: String,
    grade: { type: Schema.ObjectId, ref: "PriceGrade" },
	name: String,
	lastName: String,
	birthdayDate: String,
	birthdayPlace: String,
	ciudadania: String,
	insuranceSocial: String,
	livewith: String,
	inactivar: Boolean,
	hijoMaestro: Boolean,
	vuelveAnioProximo: Boolean,

	graduationFee: Number,
	admissionFeeStudent: Array,
	totalAdmissionFeeStudent: String,
	instruccionStudent: String,
	matriculaStudent: String,
	seguroStudent: String,
	instruccionAnualStudent: String,
	meses: Number,
	cuido: String,
	librosDigitales: String
});

module.exports = mongoose.model('Student', studentSchema, 'student');