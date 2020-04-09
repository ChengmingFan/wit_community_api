let User = require('../models/User')
const config = require('../config')
const Jwt = require('jsonwebtoken')
const express = require('express')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

function tokenSign({id, username}) {
    try {
        return Jwt.sign({id, username}, config.token.secretOrPrivateKey, config.token.options)
    } catch (e) {
        throw e
    }
}

module.exports = {
    register(req, res) {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            createdTime: new Date()
        })

        user.save((err, docs) => {
            if (err) {
                const error_type = err.errmsg.split('index: ')[1].split('_1 dup')[0]
                if (error_type === 'email')
                    res.send({'code': 0, 'errorMsg': 'Failed to register: email has been used!'})
                else if (error_type === 'username')
                    res.send({'code': 0, 'errorMsg': 'Failed to register: username has been used!'})
                else {
                    res.send({'code': 0, 'errorMsg': 'Failed to register'})
                }
            } else {
                res.send({'code': 1, 'msg': 'Successful to register!'})
            }
        })
    },
    getAllUsers(req, res) {
        res.setHeader('Content-Type', 'application/json')
        User.find(function (err, users) {
            if (err) {
                res.send(err)
            }
            res.json(users)
        })
    },
    getUserById(req, res) {
        const id = req.params.id
        User.findById(id, function (err, user) {
            if (err) {
                res.send({code: 0, msg: 'Failed to get data: ' + err})
            } else if (user) {
                res.send({code: 1, user: user})
            } else {
                res.send({code: 0, msg: 'No This ID'})
            }
        })
    },
    async updateUser(req, res) {
        const user = new User(req.body)
        const id = ObjectId(user._id)
        const doc = await User.findById(id)
        if (doc) {
            doc.set(user)
            await doc.save((err, docs) => {
                if (err)
                    res.send({code: 0, msg: 'Failed to update'})
                else {
                    res.send({code: 1, msg: 'Successful to update!', user: docs})
                }
            })
        } else {
            res.send({code: 0, msg: 'No this user'})
        }
    },
    deleteUser(req, res) {
        const id = req.params.id
        User.findByIdAndDelete(id, (error, docs) => {
            if (error)
                res.send({code: 0, msg: 'Failed to delete'})
            if (docs)
                res.send({code: 1, msg: 'Successful to delete'})
            else
                res.send({code: 0, msg: 'No Related Data'})
        })
    }
    ,
    async login(req, res) {
        const {username, password} = req.body
        const dbUser = await User.findOne({username})
        if (dbUser) {
            dbUser.comparePassword(password, function (err, isMatch) {
                if (err)
                    throw err
                if (isMatch) {
                    res.send({
                        code: 1,
                        user: dbUser.toJSON(),
                        msg: 'Successful to Login in',
                        token: tokenSign(dbUser)
                    })
                } else {
                    res.send({code: 0, msg: 'Incorrect Password!'})
                }
            })
        } else {
            res.send({code: 0, msg: 'No this user'})
        }
    },

}
