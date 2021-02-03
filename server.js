'use strict'
require ('./config/passportConfig');
const mongoose = require('mongoose')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const passport = require('passport');

const PORT = process.env.PORT || 3000;
const api = require('./routes/api')

//const db = 'mongodb+srv://pabloUser:pabloUser@cluster0-cvml2.mongodb.net/dbSchool?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dbSchool', {
        useUnifiedTopology: true, 
        useNewUrlParser: true, 
        useCreateIndex: true 
    }, err => {
    if(err) {
        console.log('Error', err)
    } else {
        console.log('Connected to mongodb')
    }
})

const app = express();

// Middleware
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.json());

app.use('/api', api)
app.get('/', function(req, res){
    res.send('Hello from server')
})

app.listen(PORT, function() {
    console.log('Servidor corriendo en localhost:' + PORT)
})
