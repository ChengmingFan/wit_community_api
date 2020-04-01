let Comment = require('../models/Comment')
let Post = require('../models/Post')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

module.exports = {
    async comment(req, res) {
        const time = new Date()
        const comment = new Comment({
            parentId: req.body.parentId,
            content: req.body.content,
            creatorId: req.body.creatorId,
            createdTime: time
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
                    author: '$user'
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
    }
}
