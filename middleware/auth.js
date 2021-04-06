const asyncHandler = require('../middleware/asyncHandler');
const UserSchema = require('../models/User');
const jwt = require('jsonwebtoken');
const errHandler = require('../utils/errorresponse');
const errorHandler = require('./errorhandler');

exports.protect = asyncHandler(async(req,res,next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) return next(new errHandler("Not Authorize to access this route",401));

    try {
        const decoded = jwt.verify(token,process.env.JWT_secret);
        req.user = await UserSchema.findById(decoded.id);

        next();
    } catch (error) {
        return next(error);
    }
});

exports.authorize = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next(new errHandler(`Role: ${req.user.role} - User is not alowed to commit an action`,403));
        }
        console.log('authorize by role is PASSED'.green);
        next();
    }
}