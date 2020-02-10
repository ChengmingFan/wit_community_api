// let mongoose = require('mongoose')
let mongoose = require('../db/db')
let CommentSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    content: {
        type: String,
        required: true,
        min: 1,
        max: 256
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdTime: {
        type: Date,
        required: true
    }
},
{collection: 'comments'})

const Comment = module.exports = mongoose.model('Comment', CommentSchema)

