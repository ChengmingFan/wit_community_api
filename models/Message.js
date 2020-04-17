let mongoose = require('../db/db')
let MessageSchema = new mongoose.Schema({
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        senderName: {
            type: String,
            required: true
        },
        senderAvatar: {
            type:String,
            required:false
        },
        receiverId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        receiverName: {
            type: String,
            required: true
        },
        receiverAvatar: {
            type:String,
            required:false
        },
        content: {
            type: String,
            required: true
        },
        status: {
            type: Number,
            default: 0 //0 is unread,1 is read
        },
        createdTime: {
            type: Date,
            required: true
        }
    },
    {collection: 'messages'})
const Message = module.exports = mongoose.model('Message', MessageSchema)
