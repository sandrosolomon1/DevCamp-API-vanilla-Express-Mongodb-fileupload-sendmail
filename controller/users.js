const asyncHandler = require('../middleware/asyncHandler');
const UserSchema = require('../models/User');
const express = require('express');
const errHandler = require('../utils/errorresponse');
const errorHandler = require('../middleware/errorhandler');
const sendemail = require('../utils/sendemail');
const User = require('../models/User');
const crypto = require('crypto');
const errorResponse = require('../utils/errorresponse');

const sendTokenResponse = (user,statusCode,res) => {
    const token = user.getsignjwttoken();

    const options = {
        expiresIn: new Date(Date.now()+process.env.JWT_COOKIE_EXP*24*60*60*1000),
        httpOnly: true
    };

    res.status(statusCode)
        .cookie('token',token,options)
        .json({
            success: true,
            token
        })
}

module.exports.register = asyncHandler(async (req,res,next) => {
    const {name,email,role,password} = req.body;

    const user = await UserSchema.create({
        name,
        email,
        role,
        password
    });

    sendTokenResponse(user,200,res);
})

module.exports.login = asyncHandler(async (req,res,next) => {
    const {email,password} = req.body;

    if(!email || !password) next(new errHandler("Please provide Email or Password",401));

    const user = await UserSchema.findOne({email}).select('+password');

    if(!user) next(new errHandler("Credentials error",404));

    const ismatch = await user.matchPass(password);

    if(!ismatch) next(new errHandler("You Entered Wrong password",401));
    else sendTokenResponse(user,200,res);
})

module.exports.getme = asyncHandler((req,res,next) => {
    //const user = await UserSchema.findById(req.user.id);

    //if(!user) next(new errHandler("User aint found bruh",401));

    res.status(200).json({
        success:true,
        user: req.user
    })
});

module.exports.forgotpassword = asyncHandler(async (req,res,next) => {
    const user = await UserSchema.findOne({ email : req.body.email });

    if(!user) next(new errHandler("Email is incorrect",401));

    const resetpasswordtoken = user.getresetpasswordtoken();

    user.save({ validateBeforeSave : false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/forgotpassword/${resetpasswordtoken}`;

    const options = {
        email : req.body.email,
        subject : 'password reset',
        text : `You requested password reset , please make put request to ${resetURL}`
    }

    try {
        await sendemail(options);

        res.status(200).json({
            success:true,
            data: 'Email sent'
        })
    } catch (error) {
        console.log(error);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        user.save({ validateBeforeSave: false });

        next(new errHandler("Email couldnt be sent",500));
    }
});

module.exports.resetPassword = asyncHandler(async (req,res,next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetpasswordtoken)
        .digest('hex');

    const user = await UserSchema.findOne
        ({ resetPasswordToken, 
            resetPasswordExpire: {$gt: Date.now()}
        })

    if(!user) next(new errHandler("Invalid Token",400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    user.save();

    sendTokenResponse(user,200,res);
})

exports.updateDetails = asyncHandler(async (req,res,next) => {
    const updatefields = {
        email: req.body.email,
        name: req.body.name
    }

    let user = await UserSchema.findById(req.user.id)

    if(!user) return next(new errHandler('User not found',400))

    user = await UserSchema.findByIdAndUpdate(req.user.id,updatefields, {
        new: true,
        runValidators: true
    })

    sendTokenResponse(user,200,res)
})

exports.updatePassword = asyncHandler(async (req,res,next) => {

    let user = await UserSchema.findById(req.user.id).select('+password')

    if(!user.matchPass(req.body.newpassword)) return next(new errHandler('Wrong password betch',400));

    user.password = req.body.newpassword;
    await user.save({validateBeforeSave: false})

    sendTokenResponse(user,200,res)
})