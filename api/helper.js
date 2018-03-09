const request = require('request-promise')
const db = require('../model/db')
const API_FB = "https://graph.facebook.com/v2.10/"
class Helper {
    async getRandomToken(){
        let account = await db('account')
                            .where('status',1)
                            .orderBy('updated_at','desc')
                            .limit(1)
                            .select()
        return account[0].access_token;
    }

    async getInfoPost(postId,accessToken){
        let url = API_FB + `${postId}?fields=from,picture&access_token=${accessToken}`
        let result = await request.get(url)
        return result
    }

    async getAccountName(accessToken){
        try {
            let urlRequest = API_FB + `me?access_token=${accessToken}&format=json&pretty=0`
            let result = await request.get(urlRequest)
            let name = JSON.parse(result).name
            return name        
        } catch (error) {
            
        }
    }

    async getAccountInfo(accessToken){
        try {
            let name = await this.getAccountName(accessToken)
            let urlApp = `https://graph.facebook.com/app?access_token=${accessToken}`
            let result = await request.get(urlApp)
            result = JSON.parse(result)
            let appId = result.id
            let urlRequestCookie = "https://api.facebook.com/method/auth.getSessionforApp"
            let requestCookie = await request({
                url : urlRequestCookie,
                qs : {
                    access_token : accessToken,
                    new_app_id : appId,
                    generate_session_cookies : 1,
                    format : "json"
                }
            })
            requestCookie = JSON.parse(requestCookie)
            let cookieJson = requestCookie.session_cookies;
            let userId = requestCookie.uid
            let cookieString = this.buildCookieString(cookieJson)
            let accountInfo = {
                "access_token" : accessToken,
                "user_id" : userId,
                "cookie" : cookieString,
                "name" : name
            }
            return accountInfo
        } catch (error) {
            return null;
        }

    }

    buildCookieString(cookieJson){
        let cookieString = ""
        for(let i = 0; i < cookieJson.length;i++){
            cookieString += cookieJson[i].name+"="+cookieJson[i].value+"; "
        }
        return cookieString;
    }

}

module.exports = new Helper()