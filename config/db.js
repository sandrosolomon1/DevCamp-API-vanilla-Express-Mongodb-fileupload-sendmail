const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

dotenv.config({path : 'config.env'});

const connectdb = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI_SRV, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        });
    
        console.log(colors.underline.green(`MongoDB connected : ${db.connection.host}`));   
    } catch (error) {
        console.log(colors.underline.red(error));
    }
}

module.exports = connectdb;