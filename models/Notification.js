let mongoose = require('../db/db')
let NotificationSchema = new mongoose.Schema({
    type: {
        type: Number //1 is like,2 is comment,3 is reply
    },
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    receiverId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    contentId: {
        type: mongoose.Types.ObjectId,
        required: false
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
    {collection: 'notifications'})
const Notification = module.exports = mongoose.model('Notification', NotificationSchema)
