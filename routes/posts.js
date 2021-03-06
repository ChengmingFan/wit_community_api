let Post = require('../models/Post')
let Comment = require('../models/Comment')
// let mongoose = require('../db/db')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

module.exports = {
    post(req, res) {
        const time = new Date()
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            creatorId: req.body.creatorId,
            createdTime: time,
            updatedTime: time,
            subarea: req.body.subarea
        })
        post.save((err, docs) => {
            if (err) {
                console.log(err)
                res.send({code: 0, msg: 'Failed to post'})
            } else {
                res.send({code: 1, msg: 'Successful to post!'})
            }
        })
    },
    async getPostDetail(req, res) {
        const post_id = req.params.id
        const dbPost = await Post.findById(post_id)
        if (dbPost) {
            var post = await Post.aggregate([
                {
                    $match: {_id: ObjectId(post_id)}
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creatorId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {$unwind: '$user'},
                {
                    $project: {
                        _id: '$_id',
                        viewCount: '$viewCount',
                        commentCount: '$commentCount',
                        title: '$title',
                        content: '$content',
                        createdTime: '$createdTime',
                        updateTime: '$updatedTime',
                        author: '$user',
                        creatorId: '$creatorId'
                    }
                }
            ])
            var comments = await Comment.aggregate([
                {
                    $match: {parentId: ObjectId(post_id)}
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creatorId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {$sort:{createdTime:1}},
                {$unwind: '$user'},
                {
                    $project: {
                        _id: '$_id',
                        content: '$content',
                        createdTime: '$createdTime',
                        author: '$user',
                        creatorId: '$creatorId',
                        likeCount: '$likeCount',
                        commentCount: '$commentCount',
                        parentId: '$parentId'
                    }
                }
            ])
            await Post.updateOne({'_id': post_id}, {$inc: {'viewCount': 1}}, (err, docs) => {
                if (err)
                    res.send({code: 0, msg: err})
            })
            res.send({
                code: 1,
                post: post[0],
                comments: comments
            })
        } else {
            res.send({
                code: 0,
                msg: 'No This Post'
            })
        }
    },
    async getAllPosts(req, res) {
        var posts = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $sort: {'updatedTime': -1}
            },
            {$unwind: '$user'},
            {
                $project: {
                    _id: '$_id',
                    viewCount: '$viewCount',
                    commentCount: '$commentCount',
                    title: '$title',
                    content: '$content',
                    createdTime: '$createdTime',
                    updateTime: '$updatedTime',
                    author: '$user',
                    creatorId: '$creatorId'
                }
            }
        ])

        res.json({
            code: 1,
            posts: posts
        })

    },
    async getSubareaPosts(req,res) {

        var posts = await Post.aggregate([
            {
                $match: {subarea: req.params.subarea}
            },
            {
                $sort: {'createdTime': -1}
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {$unwind: '$user'},
            {
                $project: {
                    _id: '$_id',
                    viewCount: '$viewCount',
                    commentCount: '$commentCount',
                    title: '$title',
                    content: '$content',
                    createdTime: '$createdTime',
                    updateTime: '$updatedTime',
                    author: '$user',
                    creatorId: '$creatorId'
                }
            }
        ])

        res.json({
            code: 1,
            posts: posts
        })
    },
    // fuzzy search
    async searchPosts(req, res) {
        const keyword = req.params.keyword

        const reg = new RegExp(keyword, 'i')
        Post.aggregate([
            {
                $match: {
                    title: {$regex: reg}
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $sort: {'updatedTime': -1}
            },
            {$unwind: '$user'},
            {
                $project: {
                    _id: '$_id',
                    viewCount: '$viewCount',
                    commentCount: '$commentCount',
                    title: '$title',
                    content: '$content',
                    createdTime: '$createdTime',
                    updateTime: '$updatedTime',
                    author: '$user',
                    creatorId: '$creatorId'
                }
            }
        ],function (err, posts) {
            if (err) {
                res.send({code: 0, msg: err})
            } else {
                res.send({code: 1, posts: posts})
            }
        })
    }
    ,
    deletePost(req, res) {
        const id = req.params.id
        Post.findByIdAndDelete(id, (error, docs) => {
            if (error)
                res.send({code: 0, msg: 'Failed to delete'})
            if (docs)
                res.send({code: 1, msg: 'Successful to delete'})
            else
                res.send({code: 0, msg: 'No Related Data'})
        })
    }
    ,
    updatePost(req, res) {
        const post = new Post({
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            updatedTime: new Date
        })
        const id = post.id
        Post.findOneAndUpdate({_id: id}, post, {new: true}, function (err, post) {
            if (err)
                res.send({code: 0, msg: 'Failed to update: ' + err})
            if (post)
                res.send({code: 1, msg: 'Successful to update!', post: post})
            else
                res.send({code: 0, msg: 'No this post'})
        })
    },
    async getPopular(req, res) {
        var posts = await Post.aggregate([
            {
                $sort: {'commentCount': -1, 'updatedTime': -1}
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creatorId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {$unwind: '$user'},
            {
                $project: {
                    _id: '$_id',
                    viewCount: '$viewCount',
                    commentCount: '$commentCount',
                    title: '$title',
                    content: '$content',
                    createdTime: '$createdTime',
                    updateTime: '$updatedTime',
                    author: '$user',
                    creatorId: '$creatorId'
                }
            }
        ])
        res.json({
            code: 1,
            posts: posts
        })
    },

    async getPostByUserId (req, res) {
        Post.find({creatorId: req.params.id}).sort({'createdTime': -1}).exec(function (err, posts) {
            if (err) {
                res.send({code: 0, msg: err})
            } else {
                res.send({code: 1, posts: posts})
            }
        })
    }
}
