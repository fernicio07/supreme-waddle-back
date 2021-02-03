'use strict'

//  Va ser una especie de clase que va tener una serie de metodos o acciones 
// que va poder hacer con la entidad de User

const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
var User = require('../models/user');
const jwt = require('jsonwebtoken')

// const User = mongoose.model('User');

var controller = {
        
    nuevoRegister: (req, res, next) => {
        var user = new User();
        user.userName = req.body.userName;
        user.password = req.body.password;
        user.save((err, doc) => {
            if (!err)
                res.send(doc);
            else {
                if (err.code == 11000)
                    res.status(422).send(['Duplicate username.']);
                else
                    return next(err);
            }

        });
    },

    authenticate: (req, res, next) => {
        // call for passport authentication
        passport.authenticate('local', (err, user, info) => {       
            // error from passport middleware
            if (err) return res.status(400).json(err);
            // registered user
            else if (user) return res.status(200).json({ "token": user.generateJwt() });
            // unknown user or wrong password
            else return res.status(404).json(info);
        })(req, res);
    },

    userProfile: (req, res, next) => {
        User.findOne({ _id: req._id },
            (err, user) => {
                if (!user)
                    return res.status(404).json({ status: false, message: 'User record not found.' });
                else
                    return res.status(200).json({ status: true, user : _.pick(user,['userName']) });
            }
        );
    },

    // register: function(req, res) {
    //     let userData = req.body
    //     let user = new User(userData)
    //     user.save((error, registeredUser) => {
    //         if (err) return res.status(500).send({message: 'Error al registrar.'});
    //         if (!registeredUser) return res.status(404).send({message: 'No se ha podido registrar.'});
            
    //         let payload = { subject: registeredUser._id }
    //         let token = jwt.sign(payload, 'secretKey')
    //         return res.status(200).send({token})
    //     })
    // },

    // login: function(req, res) {
    //     let userData = req.body
    //     User.findOne({userName: userData.userName}, (error, user) => {
    //         if(error) {
    //             console.log(error)
    //         } else {
    //             if(!user) {
    //                 return res.status(401).send({status: false, message: 'Invalid userName'})
    //             } else if (user.password !== userData.password) {
    //                 return res.status(401).send({status: false, message: 'Invalid password'})
    //             } else {
    //                 let payload = { subject: user._id }
    //                 let token = jwt.sign(payload, 'secretKey')
    //                 return res.status(200).send({status: true, token: token, user: user.userName})
    //             }
    //         }
    //     })
    // }
    validatePassword: function(req, res) {
        passport.authenticate('local', (err, user, info) => {       
            // error from passport middleware
            if (err) return res.status(400).json(err);
            // registered user
            else if (user) return res.status(200).json({status: true});
            // unknown user or wrong password
            else return res.status(404).json(info);
        })(req, res);
    }
}

module.exports = controller;