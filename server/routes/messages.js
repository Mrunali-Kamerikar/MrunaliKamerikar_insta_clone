const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json("Token invalid");
            req.user = user;
            next();
        });
    } else return res.status(401).json("Not authenticated");
};

// SEND MESSAGE
router.post('/', verifyToken, async (req, res) => {
    // Generate consistent Conversation ID (smallerId_largerId)
    const ids = [req.user.id, req.body.recipientId].sort();
    const conversationId = ids.join("_");

    const newMessage = new Message({
        conversationId: conversationId,
        sender: req.user.id,
        text: req.body.text
    });

    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) { res.status(500).json(err); }
});

// GET CONVERSATION
router.get('/:userId', verifyToken, async (req, res) => {
    const ids = [req.user.id, req.params.userId].sort();
    const conversationId = ids.join("_");

    try {
        const messages = await Message.find({ conversationId: conversationId });
        res.status(200).json(messages);
    } catch (err) { res.status(500).json(err); }
});

module.exports = router;