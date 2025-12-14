const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// --- DUPLICATE MIDDLEWARE (Keep it simple for now) ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        jwt.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json("Token is not valid!");
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You are not authenticated!");
    }
};

// --- FOLLOW A USER ---
router.put('/:id/follow', verifyToken, async (req, res) => {
    if (req.user.id !== req.params.id) {
        try {
            const userToFollow = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user.id);

            if (!userToFollow.followers.includes(req.user.id)) {
                // 1. Add current user to target's followers
                await userToFollow.updateOne({ $push: { followers: req.user.id } });
                // 2. Add target user to current user's following
                await currentUser.updateOne({ $push: { following: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot follow yourself");
    }
});

// --- UNFOLLOW A USER ---
router.put('/:id/unfollow', verifyToken, async (req, res) => {
    if (req.user.id !== req.params.id) {
        try {
            const userToUnfollow = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user.id);

            if (userToUnfollow.followers.includes(req.user.id)) {
                await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot unfollow yourself");
    }
});

// GET ALL USERS (To find people to follow)
router.get('/all/everyone', async (req, res) => {
    try {
        // Fetch all users, only return _id, username, and email
        const users = await User.find({}, { username: 1, email: 1, followers: 1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;