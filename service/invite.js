const Facebook = require('./fb.js');
const db = require('../model/db')

const schedule = require('node-schedule')
const MAXINVITE = 400
const MAXINVITEONCE = 10

async function bulkInvite(posts, accounts, accountPerPost){
    let flag = 0;
    await posts.forEach(async (post,index) => {
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
                if(typeof invitedResult === 'string') {
                    await db('account').where('user_id',account.user_id)
                                        .update('logs',invitedResult)
                } else {
                    console.log(invitedResult)
                    console.log(`${account.name} Invited Post `+ post.post_id + " : " + invitedResult.num_invited)
                    await db('account').where('user_id',account.user_id)
                                        .update({
                                            'updated_at' :new Date(),
                                            'num_invited' : db.raw('num_invited + '+ invitedResult.num_invited),
                                            'logs' : ''
                                        })
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
    let accounts = await db('account')
                    .where('num_invited','<', MAXINVITE)
                    .where('status',1)
                    .select()
    let numAcc = accounts.length;
    // Stop when no account in database
    if(numAcc == 0) return ;
    let posts = await db('post').orderBy('updated_at','asc')
                        .where('status',1)
                        .select()
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

// main()
var j = schedule.scheduleJob('*/10 * * * *', function(){
    console.log('Run at Invite : ' + new Date())
    main();
});