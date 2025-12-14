// server/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: { // One-to-Many: A Post belongs to one Author
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // CRITICAL: Points to the User model
        required: true
    },
    imageUrl: { // Keeping it simple: a URL string
        type: String,
        required: true
    },
    caption: {
        type: String,
        max: 500
    },
    likes: [{ // Many-to-Many: Many users can like one post
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
},
{ timestamps: true } // Use timestamps for createdAt (required by prompt)
);

module.exports = mongoose.model('Post', PostSchema);