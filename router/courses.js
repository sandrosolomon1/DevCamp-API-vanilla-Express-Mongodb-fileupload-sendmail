const { Router } = require('express');
const express = require('express');
const advanceresults = require('../middleware/advanceresults');
const coursesModel = require('../models/Course');
const {protect} = require('../middleware/auth');

const {
    getcourses,
    postcourse,
    deletecourse,
    getsinglecourse,
    putcourse,
    getCourseBybootcampID
} = require('../controller/courses');

const router = express.Router({mergeParams:true});

router.route('/')
      .get(advanceresults(coursesModel,{path: 'bootcamps',select: 'name'}),getcourses)
      .post(protect,postcourse);

router.route('/:bootcampID/courses')
      .get(getCourseBybootcampID);

router.route('/:id')
      .get(getsinglecourse)
      .put(protect,putcourse)
      .delete(protect,deletecourse);

module.exports = router;