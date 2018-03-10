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
    async getTypeObject(objectId, accessToken){
        try {
            let typeObjectUrl = `https://graph.facebook.com/v2.12/394555237669723?metadata=1&access_token=${accessToken}&format=json`
            let resulttypeObject = await request.get(typeObjectUrl)
            resulttypeObject = JSON.parse(resulttypeObject)
            let typeObject = resulttypeObject.metadata.type
            return typeObject            
        } catch (error) {
            
        }
    }

    async getInfoPost(objectId,accessToken){
        let postId
        try {
            let typeObject = await this.getTypeObject(objectId, accessToken)
            // If type Obejct is photo you must get PostId
            if(typeObject === 'photo'){
                let url = API_FB + `${objectId}?fields=page_story_id,from,picture&access_token=${accessToken}`
                let result = await request.get(url)
                result = JSON.parse(result)
                let pageStoryId = result.page_story_id
                let tmp = pageStoryId.split('_')
                let postId = tmp[1]
                return {
                    postId: postId,
                    pageName: result.from.name,
                    pageId: result.from.id,
                    picture: result.picture
                }
            } else {
                let url = API_FB + `${objectId}?fields=from,picture&access_token=${accessToken}`
                let result = await request.get(url)
                result = JSON.parse(result)
                return {
                    postId: objectId,
                    pageName: result.from.name,
                    pageId: result.from.id,
                    picture: result.picture
                }              
            }
           
        } catch (error) {
            
        }

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