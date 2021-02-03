const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const Schema = mongoose.Schema

const userSchema = new Schema({
    userName: {
        type: String,
        required: 'userName can\'t be empty',
        unique: true
    },
    password: String,
    saltSecret: String
})

// Events
userSchema.pre('save', function(next){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        })
    })
})

// Methods
userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.generateJwt = function() {
    console.log("*** Generando JWT ****");
    return jwt.sign({_id: this._id}, 'secretKey', {expiresIn: '24h'});
}

module.exports = mongoose.model('user', userSchema, 'users')