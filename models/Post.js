// let mongoose = require('mongoose')
let mongoose = require('../db/db')
let PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: 1,
        max: 256
    },
    content:{
        type: String,
        required: true,
        min: 1,
        max: 512
    },
    viewCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    createdTime: {
        type: Date,
        required: true
    },
    updatedTime: {
        type: Date,
        required: true
    },
    subarea: {
        type: String,
        required: true
    }
},
{collection: 'posts'})

const Post = module.exports = mongoose.model('Post', PostSchema)
