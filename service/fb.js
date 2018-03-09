const fs = require('fs');
const request = require('request-promise')
const path = require('path')
const cheerio = require('cheerio')
require('dotenv').config()
const BUSSINESS_FB = "https://business.facebook.com"
class Facebook{
    constructor(cookie){
        this.cookie = cookie;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
            'Cookie' : cookie
        }      
    }

    async deplay(millsec){
        return new Promise((reslove) => {setTimeout(reslove,millsec)})
    }

    async checkLive(accessToken){
        let urlRequest =  `https://graph.facebook.com/v2.10/me?access_token=${accessToken}`
        try {
            let result = await request.get(urlRequest)
            result = JSON.parse(result)
            if(result.name) return true;
            return false;            
        } catch (error) {
            return false
        }        
    }
    /** 
     * Get Hidden Token fb fb_dtsg
     * fb_dtsg : Hidden token for request in facebook request
    */
    async getToken(){
        let url = "https://mbasic.facebook.com/";
        let options = {
            uri : url,
            headers : this.headers
        }
        try {
            let response = await request(options);
            let $ = cheerio.load(response);
            let token = $("input[name='fb_dtsg']").val();
            return token;
        } catch (error) {
            return error;
        }
    }


    /**
     * Function request invite 1 people like page
     * @param {*} userId : UserID which profile use for invite action
     * @param {*} pageId : PageID 
     * @param {*} postId : PostID
     * @param {*} invitee : invitee is profileID who want invite
     */
    async inviteLike(pathInvite,userId,token){
        let urlInvite = BUSSINESS_FB + pathInvite;
        let options = {
            uri : urlInvite,
            headers : this.headers,
            method : 'POST',
            form : {
                "__user" : userId,
                "__a" : 1,
                "fb_dtsg" : token
            }
        }
        try {
            let result = await request(options)
            if(result) {
                let regex = /invitee=([0-9]+)/g
                let tmp = regex.exec(pathInvite)
                if(!tmp) { return 0 }
                return tmp[1]
            }
            return ;
        } catch (error) {
            return error
        }
        
    }

    /**
     * Get list people to invite likes
     * @param {} postId 
     * @param {*} userId 
     * @param {*} limit 
     */
    async getInvitees(postId, userId, limit=2000){
        let urlRequest = `https://business.facebook.com/ufi/reaction/profile/browser/fetch/?limit=${limit}&total_count=${limit}&ft_ent_identifier=${postId}&dpr=2&__user=${userId}&__a=1`
        let options = {
            uri : urlRequest,
            headers : this.headers  
        }
        try {
            let result = await request(options)
            result = result.replace(/\\/g,"")
            const regex = /ajaxify="(.+?)"/g;
            let lInvitee = [];
            let tmp
            do {
                tmp = regex.exec(result);
                if (tmp) {
                    let urlPathInvite = tmp[1].replace(/&amp;/g, '&')
                    lInvitee.push(urlPathInvite)
                }
            } while (tmp)
            return lInvitee;
        } catch (error) {
            return lInvitee
        }
        return lInvitee
    }

    async invitePost(postId,userId,maxLimitInvite){
        let token = await this.getToken()
        let num_invited = 0;
        let lInvitee = await this.getInvitees(postId,userId)
        if(lInvitee.length == 0) return 0;
        lInvitee = lInvitee.splice(0,maxLimitInvite)
        for(let pathInvite of lInvitee){
            try {
                let invited = await this.inviteLike(pathInvite,userId,token)
                if(invited == 0) return 0;
                await this.deplay(5000);
                if(process.env.DEBUG){
                    console.log("Invited : "+ invited)
                }
                num_invited++;                
            } catch (error) {
                
            }

        }
        return num_invited;
    }
}

module.exports = Facebook;