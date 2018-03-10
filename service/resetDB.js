const db = require('../model/db')
const MAXINVITE = 400
const schedule = require('node-schedule')
/** 
 * Function help reset number Invited of account
*/
async function resetNumInvited(){
    await db('account').where('updated_at','<',new Date())
                    .where('num_invited', '>=', MAXINVITE)
                    .update('num_invited',0)
}

var j = schedule.scheduleJob('50 23 * * *', function(){
    console.log('Clear DB at : ' + new Date())
    resetNumInvited();
})
