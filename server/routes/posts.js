const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE: VERIFY TOKEN ---
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

// --- ROUTES ---

// 1. CREATE POST
router.post('/', verifyToken, async (req, res) => {
    const newPost = new Post({
        ...req.body,
        author: req.user.id
    });
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. FEED ALGORITHM: Followed Users + My Own Posts
router.get('/feed', verifyToken, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        
        // ADDED LOGIC: Include my own ID in the list of authors to fetch
        const authorsToFetch = [...currentUser.following, req.user.id];

        const userPosts = await Post.find({ author: { $in: authorsToFetch } })
            .populate('author', 'username')
            .sort({ createdAt: -1 }); // Sort by newest
            
        res.json(userPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. LIKE / UNLIKE POST (Toggle)
router.put('/:id/like', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.user.id)) {
            await post.updateOne({ $push: { likes: req.user.id } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.user.id } });
            res.status(200).json("The post has been unliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. ADD COMMENT
router.post('/:id/comment', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const newComment = new Comment({
            postId: req.params.id,
            userId: req.user.id,
            username: user.username,
            text: req.body.text
        });
        const savedComment = await newComment.save();
        res.status(200).json(savedComment);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 5. GET COMMENTS
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 6. GET ALL POSTS (Utility/Testing)
router.get('/all', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET MY POSTS
router.get('/profile/mine', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- DELETE POST ---
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        // Security Check: Is the requester the author?
        if (post.author.toString() === req.user.id) {
            await post.deleteOne();
            res.status(200).json("Post deleted");
        } else {
            res.status(403).json("You can only delete your own posts");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- DELETE COMMENT ---
router.delete('/comments/:id', verifyToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        // Security Check: Is the requester the comment author?
        if (comment.userId.toString() === req.user.id) {
            await comment.deleteOne();
            res.status(200).json("Comment deleted");
        } else {
            res.status(403).json("You can only delete your own comments");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;