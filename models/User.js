// let mongoose = require('mongoose')
let mongoose = require('../db/db')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const SALT_WORK_FACTOR = 5

let UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        },
        min: 2,
        max: 20
    },
    gender: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    birthday: {
        type: Date,
        required: false
    },
    bio: {
        type:String,
        required: false
    },
    avatarUrl: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 30
    },
    createdTime: {
        type: Date
        // required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    },
    likedComments: []
},
{collection: 'users'})

UserSchema.pre('save', function (next) {
    const user = this
    if(!user.isModified('password'))
        return next()
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if(err)
            return next(err)
        bcrypt.hash(user.password, salt, function (err,hash) {
            if (err)
                return next(err)
            user.password = hash
            next()
        })
    })
})


UserSchema.method('comparePassword', function (cadidatePassword, cb) {
    bcrypt.compare(cadidatePassword, this.password, function (err, isMatch) {
        if(err)
            return cb(err)
        cb(null, isMatch)
    })
})



const User = module.exports = mongoose.model('User',UserSchema)

