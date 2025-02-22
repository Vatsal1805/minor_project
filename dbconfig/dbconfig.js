const mongoose = require('mongoose');
require('dotenv').config();

const dbconnect = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/utility')
        .then(() => {
            console.log('Database connected successfully');
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports = dbconnect;
