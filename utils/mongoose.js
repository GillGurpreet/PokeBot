require('dotenv').config();
const mongoose = require('mongoose');
const dbUser = process.env.DBUSER;
const dbPass = process.env.DBPASS;

module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            autoIndex: false,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4,
            useUnifiedTopology: true
        };
        
        mongoose.connect('mongodb+srv://' + dbUser + ':' + dbPass + '@gopicluster-hsf73.mongodb.net/test?retryWrites=true&w=majority',
            dbOptions);
        mongoose.Promise = global.Promise;

        mongoose.connection.on("connected", () => {
            console.log("Mongoose connection succesfully opened!");
        });

        mongoose.connection.on("err", err => {
            console.log(`Mongoose connection error: \n ${err.stack}`);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("Mongoose connection succesfully closed.");
        });
    }
};