const express = require('express')
const db = require('../model/db')
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
require('dotenv').config()

router.post('/sign-in',async(req,res) => {
    let username = req.body.username ? req.body.username : null
    let password = req.body.password ? req.body.password : null
    if(!username|| !password) { return res.json({message : "username and password is required"})}
    let user = await db('user').where('username',username)
        .limit(1)
        .select()
    if(user.length == 1){
        let userPassword = user[0].password
        if(bcrypt.compareSync(password,userPassword)){
            let payload = {
                name : user[0].name,
                username : user[0].username,
                role : user[0].role
            }
            let token = jwt.sign(payload,process.env.SECRET)
            return res.json({
                token : token
            })
        } else {
            return res.json({
                message : "Password don't match",
                status : 0
            })
        }

    }
    return res.status(404).json({message : "Not Found"});
})

router.post('/sign-up',async(req,res) => {
    let username = req.body.username ? req.body.username : null
    let password = req.body.password ? req.body.password : null
    let name = req.body.name ? req.body.name : "Unknow"
    password = bcrypt.hashSync(password,10)
    let user = {
        username : username,
        password  : password,
        name : name,
        role : 1
    }
    await db('user').insert(user)
    delete user.password
    return res.json({
        status : 1,
        message : "Success!!!",
        user : user
    })   
})

module.exports = router