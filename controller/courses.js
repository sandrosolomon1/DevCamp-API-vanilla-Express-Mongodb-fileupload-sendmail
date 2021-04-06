const coursesModel = require('../models/Course');
const bootcampModel = require('../models/bootcamp');

const asyncHandler = require('../middleware/asyncHandler');
const errHandler = require('../utils/errorresponse');

module.exports.getCourseBybootcampID = asyncHandler(async(req,res,next) => {
    const course = await coursesModel.find({bootcamp: req.params.bootcampID});

    if(!course) next(new errHandler(`No such Course was found at ${req.params.bootcampID}`,404));

    res.status(200).json({
        success: true,
        count: course.length,
        data: course
    });
})

module.exports.getcourses = asyncHandler(async(req,res,next) => {
    res.status(200).json(res.advanceresults);
});

module.exports.postcourse = asyncHandler(async(req,res,next) => {
    req.body.bootcamp = req.params.bootcampID;

    req.body.user = req.user.id;

    const bootcamp = await bootcampModel.findById(req.params.bootcampID);

    if(!bootcamp) next(new errHandler(`No such Bootcamp was found at ${req.params.bootcampID}`,404));

    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errHandler(`User ${req.user.id} - ${req.user.name} has no permission`,401));
    }

    const courses = await coursesModel.create(req.body);

    res.status(200).json({
        success: true,
        data: courses
    });
});

module.exports.getsinglecourse = asyncHandler(async(req,res,next) => {
    const courses = await coursesModel.findById(req.params.id)
                    .populate({
                        path: 'bootcamp',
                        select: 'name description'
                    });

    if(!courses) next();

    res.status(200).json({
        success: true,
        data: courses
    });
});

module.exports.putcourse = asyncHandler(async(req,res,next) => {
    const course = await coursesModel.findById(req.params.id);

    if(!course) return next(new errHandler(`Course was not found`,404));

    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errHandler(`User ${req.user.id} - ${req.user.name} has no permission`,401));
    }

    course = await coursesModel.findByIdAndUpdate(req.params.id,req.body,{
        new : true,
        Validators : true,
        useFindAndModify : false
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

module.exports.deletecourse = asyncHandler(async(req,res,next) => {
    const courses = await coursesModel.findById(req.params.id);

    if(!courses) next(new errHandler(`No such Course was found at ${req.params.id}`,404));

    if(courses.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errHandler(`User ${req.user.id} - ${req.user.name} has no permission`,401));
    }

    await courses.remove();

    res.status(200).json({
        success: true,
        data: courses
    });
});




