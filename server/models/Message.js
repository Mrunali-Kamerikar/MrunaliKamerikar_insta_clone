const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: String, required: true }, // unique string: "id1_id2" (sorted)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
},
{ timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);