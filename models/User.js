const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { nextTick } = require('process');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save',async function(next) {
  if(!this.isModified('password')) next();

  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hashSync(this.password, salt);
});

UserSchema.methods.getsignjwttoken = function() {
  return jwt.sign({id: this.id},process.env.JWT_secret,{
    expiresIn: process.env.JWT_exp
  })
}

UserSchema.methods.matchPass = async function(enteredpass) {
  return await bcrypt.compare(enteredpass,this.password);
}

UserSchema.methods.getresetpasswordtoken = function() {
  const resettoken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');

  this.resetPasswordExpire = Date.now() + 60 * 10000;
  return resettoken;
}

module.exports = mongoose.model('User', UserSchema);
