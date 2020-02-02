const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const uri = `${process.env.MONGO_URI}${process.env.MONGO_DB}`

mongoose.set('useCreateIndex',true)
mongoose.set('useFindAndModify',false)
mongoose.connect(uri,{ useNewUrlParser: true })

let db = mongoose.connection

db.on('open', function () {
    console.log('Successfully to Connect to [' + db.name +']')
})

db.on('error', function (err) {
    console.log('Unable to Connect to [' + db.name + ']', err)
})

module.exports = mongoose



