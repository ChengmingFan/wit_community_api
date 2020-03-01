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
                        author: '$user.username',
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
                {$unwind: '$user'},
                {
                    $project: {
                        _id: '$_id',
                        content: '$content',
                        createdTime: '$createdTime',
                        author: '$user.username',
                        creatorId: '$creatorId'
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
    getAllPosts(req, res) {
        Post.find({}).sort({'createdTime': -1}).exec(function (err, posts) {
            if (err)
                res.send(err)
            res.send({code: 1, posts: posts})
        })
    },
    getSubareaPosts(req,res) {
        Post.find({subarea: req.params.subarea}).sort({'createdTime': -1}).exec(function (err,posts) {
            if(err)
                res.send(err)
            res.send({code: 1, posts: posts})
        })
    },
    // fuzzy search
    searchPosts(req, res) {
        const keyword = req.params.keyword
        const reg = new RegExp(keyword, 'i')
        Post.find({title: {$regex: reg}}).sort({'createdTime': -1}).exec(function (err, posts) {
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
    getPopular(req, res) {
        Post.find({}).sort({'commentCount': -1, 'updatedTime': -1}).exec(function (err, posts) {
            if (err)
                res.send(err)
            res.send({code: 1, posts: posts})
        })
    }
}
