let multer = require('multer')
let fs = require('fs')
var path = require('path')
var url = 'http://8.208.14.10/images/'
let uploadUtil  = multer({
    storage: multer.diskStorage({
        destination: function (req,file,cb) {
            cb(null,'/www/images')
        },
        filename: function (req,file,cb) {
            var singfileArray = file.originalname.split('.');
            var fileExtension = singfileArray[singfileArray.length - 1];
            var changedName = (new Date().getTime()) + '.' + fileExtension
            url = url + changedName;
            cb(null,changedName)
        }
    }),
    fileFilter: function (req, file, cb) {
        let extArr = ['image/png','image/jpg','image/jpeg']
        if(extArr.includes(file.mimetype)){
            cb(null,true)
        }else {
            cb(null,false)
        }
    }
})

let singleUpload = uploadUtil.single('file')

module.exports = {
    upload(req,res){
        singleUpload(req,res,(err) => {
            if(!!err){
                console.log(err.message)
                res.json({
                    code: '2000',
                    type:'single',
                    originalname: '',
                    msg: err.message
                })
                return;
            }
            if(!!req.file){
                res.json({
                    code: '0000',
                    type:'single',
                    originalname: req.file.originalname,
                    msg: 'upload successfully',
                    url: url
                })
            } else {
                res.json({
                    code: '1000',
                    type:'single',
                    originalname: '',
                    msg: 'failed to upload'
                })
            }
        })
    }
}

