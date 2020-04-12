let Comment = require('../models/Comment')
let Post = require('../models/Post')
let User = require('../models/User')
let mongoose = require('mongoose')
let notification = require('../routes/notification')
let ObjectId = mongoose.Types.ObjectId

module.exports = {
    async comment(req, res) {
        let receiverId = ObjectId(req.body.receiverId)
        let senderId = ObjectId(req.body.senderId)
        let senderName = req.body.senderName
        const time = new Date()
        const comment = new Comment({
            parentId: req.body.parentId,
            content: req.body.content,
            creatorId: req.body.creatorId,
            createdTime: time,
            ref: req.body.ref,
        })
        comment.save((err, dbComment) => {
            if (err) {
                console.log(err)
                res.send({code: 0, msg: 'Failed to post'})
            } else {
                res.send({code: 1, msg: 'Successful to comment'})
                if(req.body.type === 0) {
                    //update commentCount of the post
                    Post.findOneAndUpdate(
                        {_id: dbComment.parentId},
                        //commetnCount add 1
                        {$inc: {commentCount: 1}},
                        {new: true},
                        function (err, docs) {
                            if (err)
                                res.send(err)
                            notification.createNotification(2,senderId,senderName,receiverId,req.body.parentId,dbComment._id,docs.title)
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
        Comment.findByIdAndDelete(id, (error, dbCommnet) => {
            if (error)
                res.send({code: 0, msg: 'Failed to delete'})
            if (dbCommnet) {
                Post.findOneAndUpdate({'_id': dbCommnet.parentId}, {$inc: {'commentCount': -1}},{new: true},function(err, post) {
                    if (err)
                        res.send({code: 0, msg: err})
                    notification.deleteNotification(2,dbCommnet.creatorId,post.creatorId,dbCommnet.parentId,dbCommnet._id)
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
        let receiverId = ObjectId(req.body.receiverId)
        let content = req.body.content
        let userId = ObjectId(req.body.userId)
        let type = req.body.type
        await User.findById(userId,function (err, user) {
            if(err){
                res.send({code: 0, msg: err})
            }
            if (user != null){
                if (type === 1){
                    user.likedComments.push(commentId)
                    notification.createNotification(1,user._id,user.username,receiverId,commentId,null,content)
                } else {
                    user.likedComments.forEach((item,index) => {
                        if(item.toString() === commentId.toString()){
                            user.likedComments.splice(index,1)
                        }
                    })
                    notification.deleteNotification(1, userId,receiverId,commentId,null)
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
