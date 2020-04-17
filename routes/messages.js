let Message = require('../models/Message')
let User = require('../models/User')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

module.exports = {
    async createMessage(req, res) {
        let senderId = ObjectId(req.body.senderId)
        let receiverId = ObjectId(req.body.receiverId)
        let sender = await User.findById(senderId)
        let receiver = await User.findById(receiverId)
        let content = req.body.content
        const message = new Message({
            senderId: senderId,
            senderName: sender.username,
            senderAvatar: sender.avatarUrl,
            receiverId: receiverId,
            receiverName: receiver.username,
            receiverAvatar: receiver.avatarUrl,
            content: content,
            createdTime: new Date()
        })
        message.save((err, docs) => {
            if (err) {
                console.log(err)
                res.send({
                    code: 0,
                    msg: err
                })
            } else {
                res.send({
                    code: 1
                })
            }
        })
    },
    async getMessage(req, res) {
        let senderId = ObjectId(req.body.senderId)
        let receiverId = ObjectId(req.body.receiverId)
        Message.find({
            $or: [
                {
                    senderId: senderId,
                    receiverId: receiverId
                },
                {
                    senderId: receiverId,
                    receiverId: senderId
                }
            ]
        }).exec(function (err, message) {
            if (err) {
                console.log(err)
            } else {
                res.send({
                    code: 1,
                    message: message
                })
            }
        })
    },
    async getUnreadMessageNum(req, res) {
        let userId = ObjectId(req.params.id)
        let num = await Message.where({'receiverId': userId, 'status': 0}).countDocuments()
        if (num === 0) {
            res.send({
                code: 0
            })
        } else {
            res.send({
                code: 1,
                unreadMessageNum: num
            })
        }
    },
    // async getMessengerList(req, res) {
    //     let userId = ObjectId(req.body.userId)
    //     let senderId = ObjectId(req.body.senderId)
    //     let senders = await Message.aggregate([
    //         {
    //             $match: {
    //                 $or: [
    //                     {receiverId: userId},
    //                     {senderId: userId,receiverId: senderId}
    //                 ]
    //             }
    //         },
    //         {
    //             $sort: {
    //                 createdTime: -1
    //             }
    //         }
    //         ,
    //         {
    //             $lookup: {
    //                 from: 'users',
    //                 localField: 'senderId',
    //                 foreignField: '_id',
    //                 as: 'user'
    //             }
    //         }
    //         ,
    //         {
    //             $unwind: '$user'
    //         }
    //         ,
    //         {
    //             $project: {
    //                 'senderName': 1,
    //                 'senderId': 1,
    //                 'content': 1,
    //                 senderAvatar: '$user.avatarUrl',
    //                 unreadNum:
    //                     {
    //                         $cond: {
    //                             if:
    //                                 {
    //                                     $eq: [0, "$status"]
    //                                 }
    //                             ,
    //                             then: 1,
    //                             else:
    //                                 0
    //                         }
    //                     }
    //             }
    //         }
    //         ,
    //         {
    //             $group: {
    //                 _id: {
    //                     senderName: "$senderName", senderId:
    //                         "$senderId", senderAvatar:
    //                         '$senderAvatar'
    //                 }
    //                 ,
    //                 content: {
    //                     $first: "$content"
    //                 }
    //                 ,
    //                 unreadNum: {
    //                     $sum: "$unreadNum"
    //                 }
    //             }
    //         }
    //     ])
    //     res.send({
    //         code: 1,
    //         messenger: senders
    //     })
    // }
    async getMessengerList(req, res) {
        let username = req.params.id
        Message.aggregate([
                {
                    $match: {
                        $or: [
                            {'receiverName': username},
                            {'senderName': username}
                        ]
                    }
                },
                {
                    $sort: {
                        createdTime: -1
                    }
                },
                {
                    $project: {
                        'senderName': 1,
                        'receiverName': 1,
                        'senderId': 1,
                        'content': 1,
                        'receiverId': 1,
                        'createdTime': 1,
                        username: {
                            $cond: {
                                if:
                                    {
                                        $eq: [username, "$senderName"]
                                    }
                                ,
                                then: "$receiverName",
                                else: "$senderName"
                            }
                        },
                        userAvatar: {
                            $cond: {
                                if:
                                    {
                                        $eq: [username, "$senderName"]
                                    }
                                ,
                                then: "$receiverAvatar",
                                else: "$senderAvatar"
                            }
                        },
                        userId: {
                            $cond: {
                                if:
                                    {
                                        $eq: [username, "$senderName"]
                                    }
                                ,
                                then: "$receiverId",
                                else: "$senderId"
                            }
                        },
                        unreadNum:
                            {
                                $cond: {
                                    if:
                                        {
                                            $and: [
                                                {
                                                    $eq: [0, "$status"]
                                                },
                                                {
                                                    $ne: [username, "$senderName"]
                                                }
                                            ]
                                        }
                                    ,
                                    then: 1,
                                    else:
                                        0
                                }
                            }
                    }
                },
                {
                    $group: {
                        _id: {
                            'last_message_between': {
                                $cond: [
                                    {
                                        $gt: [
                                            {$substr: ['$receiverName', 0, 1]},
                                            {$substr: ['$senderName', 0, 1]}
                                        ]
                                    },
                                    {$concat: ['$receiverName', ' and ', '$senderName']},
                                    {$concat: ['$senderName', ' and ', '$receiverName']}
                                ]
                            },
                        },
                        userId: {
                            $first: "$$ROOT.userId"
                        },
                        username: {
                            $first: "$$ROOT.username"
                        },
                        userAvatar: {
                            $first: "$$ROOT.userAvatar"
                        },
                        content: {
                            $first: "$$ROOT.content"
                        },
                        unreadNum: {
                            $sum: "$unreadNum"
                        },
                        createdTime: {
                            $first: "$$ROOT.createdTime"
                        },
                        lastModifiedBy: {
                            $first: "$$ROOT.senderName"
                        }
                    }
                },
                {
                    $sort: {createdTime: -1}
                }
            ],
            function (err, senders) {
                if (err)
                    console.log(err)
                else
                    res.send({
                        code: 1,
                        messenger: senders
                    })
            }
        )
    },

    async markRead(req, res) {
        let userId = ObjectId(req.body.userId)
        let senderId = ObjectId(req.body.senderId)
        await Message.updateMany({
                receiverId: userId,
                senderId: senderId
            },
            {
                $set: {status: 1}
            })
        res.send({
            code: 1
        })
    }
}
