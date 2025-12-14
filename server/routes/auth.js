const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        // 1. Check if user exists (Optional but good for stability)
        // For speed, we rely on MongoDB 'unique: true' error, but this is cleaner:
        // const userExists = await User.findOne({ email: req.body.email });
        // if(userExists) return res.status(400).send("Email already exists");

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // 4. Save and respond
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        // 1. Find user
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json("User not found");

        // 2. Compare password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        // 3. Create Token (The "Entry Pass")
        // We put the user ID inside the token so we know who is logged in later
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); 
        
        // 4. Send back token + user info (excluding password)
        const { password, ...others } = user._doc;
        res.status(200).json({ token, ...others });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;