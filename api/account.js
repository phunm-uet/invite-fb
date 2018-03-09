const express = require('express')
const db = require('../model/db')
const router = express.Router();
const authMiddleware = require('./authMiddleware')
const helper = require('./helper')

const table = db('account')

router.use(authMiddleware)


router.get('/accounts',async(req,res) => {
    let accounts = await db('account').select()
    return res.json(accounts);
})


router.get('/account/:id',async(req,res) => {
    let id = req.params.id;
    let account = await db('account').where('id',id).limit(1).select()
    if(account.length == 0) return res.status(404).json({
        message : "Not Found"
    })
    return res.json(account[0])
})

router.post('/account', async (req,res) => {
    let accessToken = req.body.access_token
    let accountInfo = await helper.getAccountInfo(accessToken)
    if(accountInfo === null) return res.json({
        status : 0,
        message : "AccessToken is invalidate"
    })

    try {
        console.log(accountInfo)
        let account = await db('account').insert({
            cookie : accountInfo.cookie,
            user_id : accountInfo.user_id,
            access_token : accountInfo.access_token,
            name: accountInfo.name
        })
        return res.json(account)        
    } catch (error) {
        return res.json({
            status : 0,
            message : "Fail to insert Account"
        })
    }

})

router.delete('/account/:accountId',async (req, res) => {
    let accountId = req.params.accountId
    try {
        await db('account').where('id',accountId).del()
        return res.json({
            message : 'Deleted'
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error'
        })
    }
    
    
})


module.exports = router