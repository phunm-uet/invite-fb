const Facebook = require('./fb.js');
const db = require('../model/db')
const schedule = require('node-schedule')
const MAXINVITE = 400

async function bulkInvite(posts, accounts){
    let flag = 0;
    await posts.forEach(async (post,index) => {
        let account = accounts[index]
        let cookie = account.cookie
        let fb = new Facebook(cookie)
        let numInvited = await fb.invitePost(post.post_id,account.user_id,1);
        
        await db('account').where('user_id',account.user_id)
                            .update({
                                'updated_at' :new Date(),
                                'num_invited' : db.raw('num_invited + '+ numInvited)
                            })
        await db('post').where('post_id',post.post_id)
                        .update({
                            'updated_at' :new Date(),
                            'num_invited' : db.raw('num_invited + '+ numInvited)
                        })
        flag++;
        console.log("Invited Post "+ post.post_id + " : " + numInvited)
        if(flag == posts.length) { await db.destroy() }
    });
    
}

async function main(){
    let accounts = await db('account')
                    .where('num_invited','<', MAXINVITE)
                    .select()
    let numAcc = accounts.length;
    // Stop when no account in database
    if(numAcc == 0) return ;
    let posts = await db('post').orderBy('updated_at','desc')
                        .limit(numAcc)
                        .select()
    let tmp = await bulkInvite(posts,accounts)
}

var j = schedule.scheduleJob('*/1 * * * *', function(){
    console.log('Run at Invite : ' + new Date())
    main();
});