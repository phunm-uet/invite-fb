const express = require('express')
const db = require('../model/db')
const router = express.Router();
const authMiddleware = require('./authMiddleware')
const helper = require('./helper')

router.use(authMiddleware)
/**
 * Get list post
 */
router.get("/posts",async(req,res) => {
    let posts = await db('post').select()
    res.json(posts);
})

/**
 * Get detail Post with PostId
 */
router.get("/post/:postId",async(req,res) => {
    let postId = req.params.postId;
    let post = await db('post').where('post_id',postId)
                                .limit(1)
                                .select();
    if(post.length == 0) return res.status(404).json({
        message : "Not Found"
    })
    return res.json(post[0])
})

/**
 * Add new Post to Database
 */
router.post("/post",async(req,res) => {
    let postId = req.body.post_id;
    let postInfo;
    // Get Post Information : picture,page id
    try {
        let rndToken = await helper.getRandomToken()
        postInfo = await helper.getInfoPost(postId,rndToken)
    } catch (error) {
        return res.json({
            status : 0,
            message : `Invalidate post ID : ${postId}`
        })
    }
    // add new post to dababase
    try {
        let post = await db('post').insert({
            post_id : postInfo.postId,
            page_id : postInfo.pageId,
            page_name : postInfo.pageName,
            picture : postInfo.picture
        })
        return res.json({
            message : "Success",
            post : post
        })
    } catch (error) {
        return res.json({
            message : "Has error when insert post"
        })
    }
})

router.put("/post/:postId",async (req, res) => {
    let postId = req.params.postId
    let status = req.body.status
    try {
        await db('post').update({
            status : status
        }).where('post_id',postId)
        return res.json({
            message : 'Updated'
        })
    } catch (error) {
        return res.status(500).json({
            message : "has error"
        })
    }
})

/**
 * Delete post
 */
router.delete("/post/:postId",async(req,res) => {
    let postId = req.params.postId;
    try {
        await db('post').where('post_id',postId)
        .del()
        return res.json({
            status : 1,
            message : `Post ${postId} deleted`
        })        
    } catch (error) {
        res.json({
            status : 0,
            message : `Post ${postId} delete has an error`
        })
    }

})
module.exports = router;