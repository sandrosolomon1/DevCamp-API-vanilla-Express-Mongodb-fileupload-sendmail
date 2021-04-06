const mongoose = require('mongoose');
const Bootcamp = require('../models/bootcamp');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true 
  }
});


// Static method to get avg of course tuitions
CourseSchema.statics.getaveragecost = async function(bootcampID) {
  console.log('Calculating AvgCost ...'.green);

  const obj = await this.aggregate([
    
    {$match: { bootcamp: bootcampID }},
    {$group: { _id: '$bootcamp' , AverageCost: {$avg: '$tuition'} }}

  ]);

  try {
    await this.model('bootcamp').findByIdAndUpdate(bootcampID,{
      averageCost: obj[0].AverageCost
    });
  } catch (error) {
    console.log(error);
  }
}

CourseSchema.post('save',function(){
  this.constructor.getaveragecost(this.bootcamp)
});

CourseSchema.pre('remove',function(){
  this.constructor.getaveragecost(this.bootcamp)
});


module.exports = mongoose.model('Course', CourseSchema);
