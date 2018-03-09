const jwt = require('jsonwebtoken')
require('dotenv').config()
const authMiddleware = function(req,res,next){
    if(req.method == 'OPTIONS') {
        next()
    }
    else {
        let authorization = req.headers['authorization']
        if(!authorization) return res.status(403).json({message : "You must send token in header"})
        var token = authorization.split("Bearer ")[1];
        jwt.verify(token,process.env.SECRET,(err,decode) => {
            if(err) {
                return res.json({
                    message : "Failed to authenticate token"
                })
            } else {
                req.decode = decode;
                next();
            }
        })
    }
}

module.exports = authMiddleware