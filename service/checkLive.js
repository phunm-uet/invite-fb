const request = require('request-promise')
const fb = require('./fb')
const db = require('../model/db')
const schedule = require('node-schedule')
async function checkLive(){
    let accounts = await db('account')
                    .where('status',0)
                    .select()
    accounts.forEach(async account => {
        let fbInstance = new fb(account)
        let checkLiveStatus = await fbInstance.checkLive()
        if(checkLiveStatus){
            await db('account').where('id', account.user_id)
                                .update('status', 1)
        }
    });
}

var tmp = schedule.scheduleJob('* */1 * * *', function(){
    console.log(`Run at : ${ new Date() }`)
})