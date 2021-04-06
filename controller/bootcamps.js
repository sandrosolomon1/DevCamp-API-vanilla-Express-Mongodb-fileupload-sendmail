const bootcampModel = require('../models/bootcamp');
const mongoose = require('mongoose');
const { json } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/nodeGeocoder');
const errHandler = require('../utils/errorresponse');
const path = require('path');

exports.getbootcamps = asyncHandler(async (req,res,next) => {
        res.status(200).json(res.advanceresults);
});

exports.getsinglebootcamp = asyncHandler(async (req,res,next) => {
    
        const bootcamp = await bootcampModel.findById(req.params.id);

        if(!bootcamp) next(err);

        res.status(200).json({
            success : true,
            data : bootcamp
        });
});

exports.postsinglebootcamp = asyncHandler(async (req,res,next) => {
    req.body.user = req.user.id;

    const publishedBootcamp = await bootcampModel.findOne({ user : req.user.id });

    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new errHandler(`User with Role ${req.user.role} Cant create more than one bootcamp`,400))
    }
    
    const bootcamp = await bootcampModel.create(req.body);

    res.status(201).json({ 
        success : true ,
        data : bootcamp
    });
});

exports.putsinglebootcamp = asyncHandler(async (req,res,next) => {
        const bootcamp = await bootcampModel.findById(req.params.id);

        if(!bootcamp) {
            return next(new errHandler(`No Such bootcamp`,400))
        }

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new errHandler(`User ${req.user.id} - ${req.user.name} has no permission`,401))
        }

        const updatedbootcamp = await bootcampModel.findOneAndUpdate(req.params.id,req.body,{
            new : true,
            Validators : true,
            useFindAndModify : false
        });

        res.status(200).json({
            success : true,
            data : updatedbootcamp
        })
});

// @DESC route : bootcamps/:id/photo

exports.photoupload = asyncHandler(async (req,res,next) => {

    if(!req.files) {next(new errHandler(`please upload file`,404))}
    else if(!req.files.file.mimetype.startsWith('image')) {next(new errHandler(`please upload an image`,404))}
    else if(req.files.file.size > process.env.MAX_UPLOAD_WEIGHT) {next(new errHandler(`image is big`,404))}
    
    const filename = `photo_${req.params.id}${path.parse(req.files.file.name).ext}`;

    req.files.file.mv(`${process.env.PHOTO_UPLOAD_PATH}/${filename}`, async err => {
        if(err) next(err);

        const bootcamp = await bootcampModel.findById(req.params.id);

        if(!bootcamp) {next(new errHandler(`bootcamp wasnt found at ${req.params.id}`,404))};

        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new errHandler(`User ${req.user.id} - ${req.user.name} has no permission`,401));
        }

        bootcamp = await bootcampModel.findByIdAndUpdate(req.params.id,{ photo: filename },{
            new : true,
            Validators : true,
            useFindAndModify : false
        });

        res.status(200).json({
            success: true,
            data: bootcamp
        });
    })
});

exports.deletesinglebootcamp = asyncHandler(async (req,res,next) => {  
        const deleteddbootcamp = await bootcampModel.findById(req.params.id);

        if(!deleteddbootcamp) {
            next(new errHandler(`bootcamp wasnt found at ${req.params.id}`,404))
        }

        if(deleteddbootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new errHandler(`User ${req.user.id} - ${req.user.name} has no permission`,401))
        }

        deleteddbootcamp.remove();

        res.status(200).json({
            success : true,
            data : deleteddbootcamp
        });
    
});

exports.getradius = asyncHandler(async (req,res,next) => { 
    const {zipcode,distance} = req.params; 
    const loc = await geocoder.geocode(zipcode);

    const radius = distance / 3963.2,
          lng = loc[0].longitude,
          lat = loc[0].latitude;

    const bootcamps = await bootcampModel.find( 
        { loc: { $geoWithin: { $centerSphere: [ [ lng, lat ] , radius ] } } }
    );

    if(!bootcamps) {
        next(err);
    }

    res.status(200).json({
        success : true,
        count : bootcamps.length,
        data : bootcamps
    });

});
