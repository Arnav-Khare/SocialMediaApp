const mongoose = require('mongoose');
require('dotenv').config()

const dbString = 'mongodb://localhost:27017/Users';
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

const connection = mongoose.createConnection(dbString,dbOptions);

const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    posts:[
        {
            title:String,
            body:String,
        }],
    followers:[
        {
            name:String,
            id:String
        }
    ],
    following:[
        {
            name:String,
            id:String,
        }
    ]
});

const User = connection.model('User', UserSchema);

// Expose the connection
module.exports = connection;