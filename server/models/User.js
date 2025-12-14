// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 50,
    },
    password: { // We will hash this in Hour 2!
        type: String,
        required: true,
        min: 6,
    },
    followers: [{ // The other users following *this* user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // CRITICAL: Points to the User model
    }],
    following: [{ // The users *this* user is following
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
},
{ timestamps: true } // Good practice, adds createdAt/updatedAt
);

module.exports = mongoose.model('User', UserSchema);