const Jwt = require('jsonwebtoken')
const config = require('../config')

function tokenVerify(token) {
    try {
        Jwt.verify(token, config.token.secretOrPrivateKey)
        return true
    }catch (e) {
        return false
    }
}

module.exports = {
    isValidToken(req, res, next){
        let bearerToken = req.headers.authorization
        try{
            let token = bearerToken.split(' ')[1]
            if(tokenVerify(token)){
                next()
            }else {
                res.status(403).send({
                    code: 403,
                    error: 'Login token is invalid, please log in again'
                })
            }
        }catch (e) {
            res.status(401).send({
                code: 401,
                error: 'Please login in to visit'
            })
        }
    }
}
