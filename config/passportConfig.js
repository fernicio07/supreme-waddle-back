const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

var User = require('../models/user');

passport.use(
    new localStrategy({usernameField: 'userName'},
    (userName, password, done) => {
        User.findOne({userName: userName}, (err, user) => {
            if (err) return done(err);
            // Unknown user
            if(!user) return done(null, false, {message: 'Usuario no esta registrado'})
            // Wrong password
            if(!user.verifyPassword(password)) return done(null, false, {message: 'Password Incorrecta'});
            // Authentication succeded
            return done(null, user);
        })
    })
)