let Notification = require('../models/Notification')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

module.exports = {
    async createNotification(type,senderId,senderName,receiverId,parentId,contentId,content){
        const notification = new Notification({
            type: type,
            senderId: senderId,
            senderName: senderName,
            receiverId: receiverId,
            parentId:parentId,
            contentId: contentId,
            content: content,
            createdTime: new Date()
        })
        notification.save((err,docs) => {
            if(err){
                console.log(err)
            } else {
            }
        })
    },
    async deleteNotification (type,senderId,receiverId,parentId,contentId){
        Notification.deleteOne({
            type: type,
            senderId: senderId,
            receiverId: receiverId,
            parentId: parentId,
            contentId: contentId
        },function (err) {
            if (err) {
                console.log(err)
            } else {
            }
        })
    },
    async getUnreadNotificationNum(req, res){
        let userId = ObjectId(req.params.id)
        let num = await Notification.where({'receiverId': userId, 'status': 0}).countDocuments()
        if(num === 0){
            res.send({
                code: 0
            })
        } else {
            res.send({
                code: 1,
                unreadNotificationNum: num
            })
        }
    },
    async getNotifications(req, res) {
        let userId = ObjectId(req.params.id)
        Notification.find({receiverId: userId}).sort({'createdTime': -1}).exec(function (err, notifications) {
            if(err) {
                res.send({code:0, msg: err})
            } else {
                res.send({code: 1,notifications: notifications})
            }
        })
    },
    async markRead (req,res) {
        let userId = ObjectId(req.params.id)
        await Notification.updateMany({
            receiverId: userId,
            status: 1
        })
        res.send({
            code: 1
        })
    }
}
