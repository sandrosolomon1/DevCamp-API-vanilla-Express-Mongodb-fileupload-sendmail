const { Router } = require('express');
const express = require('express');

const bootcampModel = require('../models/bootcamp');
const advanceresults = require('../middleware/advanceresults');
const {protect,authorize} = require('../middleware/auth');

const {
    getbootcamps,
    getsinglebootcamp,
    postsinglebootcamp,
    putsinglebootcamp,
    deletesinglebootcamp,
    getradius,
    photoupload
} = require('../controller/bootcamps');

const courses = require('./courses');

const router = express.Router();

router.route('/').get(advanceresults(bootcampModel,'courses'),getbootcamps);

router.get('/:id',getsinglebootcamp);

// merge with courses routes
router.use('/:bootcampID/courses',courses);

router.get('/radius/:zipcode/:distance',getradius);

router.post('/',protect,postsinglebootcamp);

router.put('/:id',protect,putsinglebootcamp);

router.put('/:id/photo',protect,photoupload);

router.delete('/:id',protect, authorize('publisher','admin') ,deletesinglebootcamp);

module.exports = router;