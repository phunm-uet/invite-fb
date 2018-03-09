const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const post = require('./post')
const account = require('./account')
const auth = require('./auth')
const jwt = require('jsonwebtoken')
var morgan  = require('morgan')
var port = process.env.PORT || 3000;
require('dotenv').config()

//CORS
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/api',auth)
app.use('/api',post)
app.use('/api',account)

// Default 404
app.get('*', function(req, res){
    return res.status(404).json({message : "NotFound"});
});
app.listen(port)
console.log("Server Running on port " + port)