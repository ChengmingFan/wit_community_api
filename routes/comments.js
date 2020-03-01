let Comment = require('../models/Comment')
let Post = require('../models/Post')

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
    getComment(req, res) {
        const id = req.params.id
        Comment.findById(id, function (err, comment) {
            if (err) {
                res.send({code: 0, msg: 'Failed to get data: ' + err})
            } else if (comment) {
                res.send({code: 1, comment: comment})
            } else {
                res.send({code: 0, msg: 'No Related Data'})
            }
        })
    }
}
