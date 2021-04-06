const colors = require('colors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//file system
const fs = require('fs');

const bootcamp = require('./models/bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');

dotenv.config({path : './config/config.env'});

mongoose.connect(process.env.MONGO_URI_SRV, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
});

const bootcamps = JSON.parse
    (fs.readFileSync(`${__dirname}/devcamper_project_resources/_data/bootcamps.json`,'utf-8'));

const courses = JSON.parse
    (fs.readFileSync(`${__dirname}/devcamper_project_resources/_data/courses.json`,'utf-8'));

const Users = JSON.parse
    (fs.readFileSync(`${__dirname}/devcamper_project_resources/_data/courses.json`,'utf-8'));
    
const importdata = async () => {
    try {
        await bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(Users);
        
        console.log('Bootcamps were imported'.green.inverse);
        console.log('Courses were imported'.green.inverse);
        console.log('Users were imported'.green.inverse);

        process.exit();
    } catch (error) {
        console.log(error);
    }
}

const deletedata = async () => {
    try {
        await bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        
        console.log('Bootcamps were deleted'.red.inverse);
        console.log('Courses were deleted'.red.inverse);
        console.log('Users were deleted'.red.inverse);

        process.exit();
    } catch (error) {
        console.log(error);
    }
}

if(process.argv[2] === '-i') {
    importdata();
}else if(process.argv[2] === '-d') {
    deletedata();
}





