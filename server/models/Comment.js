const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: { // Storing this saves a query later (Optimization!)
        type: String, 
        required: true 
    },
    text: {
        type: String,
        required: true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);