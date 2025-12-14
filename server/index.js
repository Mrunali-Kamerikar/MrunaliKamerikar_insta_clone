const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoute = require('./routes/auth'); 
const postRoute = require('./routes/posts'); 
const userRoute = require('./routes/users');
const messageRoute = require('./routes/messages');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoute);
app.use('/api/messages', messageRoute);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connection Success"))
.catch((err) => console.log(err));

// --- API ROUTES ---
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});