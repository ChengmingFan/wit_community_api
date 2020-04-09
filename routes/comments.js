let Comment = require('../models/Comment')
let Post = require('../models/Post')
let User = require('../models/User')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

module.exports = {
    async comment(req, res) {
        const time = new Date()
        const comment = new Comment({
            parentId: req.body.parentId,
            content: req.body.content,
            creatorId: req.body.creatorId,
            createdTime: time,
            ref: req.body.ref,
        })
        comment.save((err, docs) => {
            if (err) {
                console.log(err)
                res.send({code: 0, msg: 'Failed to post'})
            } else {
                res.send({code: 1, msg: 'Successful to comment'})
                if(req.body.type === 0) {
                    //update commentCount of the post
                    Post.update(
                        {_id: docs.parentId},
                        //commetnCount add 1
                        {$inc: {commentCount: 1}},
                        function (err, docs) {
                            if (err)
                                res.send(err)
                        }
                    )
                } else {
                    Comment.update(
                        {_id: docs.parentId},
                        //commetnCount add 1
                        {$inc: {commentCount: 1}},
                        function (err, docs) {
                            if (err)
                                res.send(err)
                        }
                    )
                }
            }
        })
    },
    deleteComment(req, res) {
        const id = req.params.id
        Comment.findByIdAndDelete(id, (error, docs) => {
            if (error)
                res.send({code: 0, msg: 'Failed to delete'})
            if (docs) {
                console.log(docs)
                Post.updateOne({'_id': docs.parentId}, {$inc: {'commentCount': -1}}, (err, docs) => {
                    if (err)
                        res.send({code: 0, msg: err})
                    res.send({code: 1, msg: 'Successful to delete'})
                })
            }
            else
                res.send({code: 0, msg: 'No Related Data'})
        })
    },
    async getComments(req, res) {
        const id = req.params.id

        var comments = await Comment.aggregate([
            {
                $match: {'parentId': ObjectId(id)}
            },
            {
                $sort: {'createdTime': 1}
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorId',
                    foreignField: "_id",
                    as: 'user'
                }
            },
            {$unwind: '$user'},
            {
                $project: {
                    _id: '$_id',
                    likeCount: '$likeCount',
                    commentCount: '$commentCount',
                    content: '$content',
                    createdTime: '$createdTime',
                    author: '$user',
                    ref: '$ref'
                }
            }
        ])
        res.json({
            code: 1,
            comments: comments
        })

    },
    async getCommentByUserId (req, res){
        var comments = await Comment.aggregate([
            {
                $match: {'creatorId': ObjectId(req.params.id)}
            },
            {
                $sort: {'createdTime': -1}
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'parentId',
                    foreignField: '_id',
                    as: 'post'
                }
            },
            {$unwind: '$post'},
            {
                $project: {
                    _id: '$_id',
                    content: '$content',
                    createdTime: '$createdTime',
                    creatorId: '$creatorId',
                    post: '$post'
                }
            }
        ])
        res.json({
            code: 1,
            comments: comments
        })
    },
    async likeComment (req,res) {
        let commentId = ObjectId(req.body.commentId)
        let userId = ObjectId(req.body.userId)
        let type = req.body.type
        await User.findById(userId,function (err, user) {
            if(err){
                res.send({code: 0, msg: err})
            }
            if (user != null){
                if (type === 1){
                    user.likedComments.push(commentId)
                } else {
                    user.likedComments.forEach((item,index) => {
                        if(item.toString() === commentId.toString()){
                            user.likedComments.splice(index,1)
                        }
                    })
                }
                Comment.updateOne({'_id': commentId}, {$inc: {'likeCount': type}}, (err,docs) => {
                    if (err){
                        res.send({code: 0, msg: err})
                    }
                })
                user.save()
                res.json({
                    code: 1,
                    likedComments: user.likedComments
                })
            }
        })
    }
}
