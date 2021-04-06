const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');
const geocoder = require('../utils/nodeGeocoder');

const BootCampShchema = new Schema({
    name : {
        type : String,
        required : [true,'please add a name'],
        unique : true,
        trim : true,
        maxlenght : [50, 'Name cant be more than 50 chars']
    },
    slug : String,
    description : {
        type : String,
        required : [true, 'please add a description'],
        maxlenght : [500, 'Name cant be more than 50 chars']
    },
    website : {
        type : String,
        match : [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
            ,'please enter valid URL with HTTp or HTTPS'
        ]
    },
    phone : {
        type : String,
        maxlenght : [20,'Phone number cant be longer that 20 chars']
    },
    email : {
        type : String,
        match : [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'please add valid email address'
        ]
    },
    address : {
        type : String,
        required : [true,'please add an address']
    },
    location : {
        //geoJSON point
        type: {
            type: String,
            enum: ['Point'],
            required: false
          },
          coordinates: {
            type: [Number],
            required: false,
            index: '2dsphere'
          },
          formattedAddress: String,
          street: String,
          city: String,
          state: String,
          zipcode: String,
          country: String,
    },
    careers : {
        // array of strings
        type : [String],
        required : true,
        enum : [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other',
        ]
    },
    averageRating: {
        type : Number,
        min : [1,'Rating must be at least 1'],
        max : [10,'Rating can not be more than 10']
    },
    averageCost: Number,
    photo : {
        type : String,
        default : 'no-photo.jpg'
    },
    Housing : {
        type : Boolean,
        default : false
    },
    jobAssistance : {
        type : Boolean,
        default : false
    },
    jobGuarantee : {
        type : Boolean,
        default : false
    },
    acceptGi : {
        type : Boolean,
        default : false
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true 
    }, 
    }, {
        toJSON : {virtuals:true},
        toObject: {virtuals:true}
    }
);

BootCampShchema.pre('save', function(next) { 
    this.slug = slugify(this.name, {lower : true});
    next();
});

BootCampShchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].latitude,loc[0].longitude],
          formattedAddress: loc[0].formattedAddress,
          street: loc[0].streetName,
          state: loc[0].state,
          city: loc[0].city,
          zipcode: loc[0].zipcode,
          country: loc[0].country,
    };

    this.address = undefined;
    next();
});

BootCampShchema.virtual('courses', {
    ref: 'Course',
    localField: '_id', // es unda emtxveodes
    foreignField: 'bootcamp', // amas
    justOne: false
});

BootCampShchema.pre('remove', async function(next) {
    await this.model('Course').deleteMany({ bootcamp: this._id });
    console.log('remove middleware was fired');
    next();
});

module.exports = mongoose.model('bootcamp',BootCampShchema);
