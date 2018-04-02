const Facebook = require('./fb.js');
const db = require('../model/db')

const schedule = require('node-schedule')
const isOnline = require('is-online');
require('dotenv').config()
const MAXINVITE = process.env.MAXINVITE
const MAXINVITEONCE = process.env.MAXINVITEONCE

async function bulkInvite(posts, accounts, accountPerPost){
    let flag = 0;
    await posts.forEach(async (post,index) => {
        let oldRemaining = post.remain_inivte
        let start = accountPerPost * index
        let end = accountPerPost * ( index + 1 )
        let lAccounts = accounts.slice(start,end)
        lAccounts.forEach( async (account, index) => {
            let cookie = account.cookie
            let fb = new Facebook(account)
            let checkLive = await fb.checkLive()
            fb.deplay(2000)
            console.log(account.name + " checkLive " + checkLive)
            if (checkLive) {
                let startIndex = index * MAXINVITEONCE
                let invitedResult = await fb.invitePost(post.post_id, startIndex, MAXINVITEONCE);
                console.log(`${account.name} Invited Post `+ post.post_id + " : " + invitedResult.num_invited)
                // Update Account 
                if(invitedResult.error) {
                    // Update logs
                    console.log(`Log ${invitedResult.error}`)
                    await db('account').where('user_id',account.user_id)
                                        .update('logs',invitedResult.error)
                                        .update('updated_at' ,new Date())
                } else {
                    await db('account').where('user_id',account.user_id)
                    .update({
                        'updated_at' :new Date(),
                        'num_invited' : db.raw('num_invited + '+ invitedResult.num_invited),
                        'logs' : ''
                    })
                }
                // Update Post 
                if(invitedResult.remain_invite < 10 && oldRemaining >= 10){
                    // If remaining < 10 don't update updated_date
                    await db('post').where('post_id',post.post_id)
                    .update({
                        'num_invited' : db.raw('num_invited + '+ invitedResult.num_invited),
                        'remain_inivte' : invitedResult.remain_invite
                    })
                } else {
                    await db('post').where('post_id',post.post_id)
                    .update({
                        'updated_at' :new Date(),
                        'num_invited' : db.raw('num_invited + '+ invitedResult.num_invited),
                        'remain_inivte' : invitedResult.remain_invite
                    })
                }
            } else {
                console.log(account.name + " will be delete")
                await db('account').update({
                    status : 0
                }).where('user_id',account.user_id)
            }            
        });
    });
    
}

async function main(){
    let accountPerPost = 1
    var d = new Date();
    d.setHours(d.getHours() - 3);
    let accounts = await db('account')
                    .where('num_invited','<', MAXINVITE)
                    .where('status',1)
                    .select()
    let numAcc = accounts.length;
    // Stop when no account in database
    if(numAcc == 0) return ;
    let posts = await db('post')
                        .where('status',1)
                        .andWhere('remain_inivte','!=',0)
                        .orWhere('updated_at','<',d)
                        .select()
    if(posts.length == 0) return ;
    // If number posts > number account => 1 account invite 1 post
    if(posts.length >= accounts.length) {
        accountPerPost = 1
        posts = posts.slice(0,numAcc)
    }
    else {
        // if number accounts > number posts divide account for each post
        accountPerPost = Math.floor(numAcc / posts.length)
    }
    let tmp = await bulkInvite(posts,accounts,accountPerPost)
}

if(process.env.enviroment == 'dev'){
    console.log('Run at Invite : ' + new Date())
    isOnline().then(online => {
        if(online) main()
        else {
            console.log("Network down")
        }
    });
}
else {
    var j = schedule.scheduleJob(process.env.cronInvite, function(){
        console.log('Run at Invite : ' + new Date())
        isOnline().then(online => {
            if(online) main()
            else {
                console.log("Network down")
            }
        });
    });
}
