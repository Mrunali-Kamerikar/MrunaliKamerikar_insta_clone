# InstaClone – Mini Instagram Project

InstaClone is a simple Instagram-style social media application built using the **MERN stack**.  
This project was developed as part of a placement assignment to demonstrate backend logic, database relationships, authentication, and frontend API integration.



## Features

### Authentication
- User signup and login
- Password hashing using bcrypt
- JWT-based authentication
- Protected routes

### Social & Post Features
- Follow and unfollow users
- View followers and following count
- Create posts using image URL and caption
- Like and unlike posts
- Add comments on posts

### Feed
- Personalized feed
- Shows posts only from users the logged-in user follows

### Frontend
- Login and Signup pages
- Home feed with posts
- Create post form
- Profile page with follow/unfollow
- Dynamic UI updates without page refresh



## Tech Stack

**Frontend:** React (Vite), Axios, CSS / Bootstrap  
**Backend:** Node.js, Express.js  
**Database:** MongoDB, Mongoose  
**Auth:** JWT, bcrypt



## Folder Structure

```bash
insta_clone/
├── server/
│ ├── models/
│ ├── routes/
│ ├── index.js
│ ├── .env
│ └── package.json
│
├── client/
│ ├── src/
│ │ ├── pages/
│ │ ├── App.jsx
│ │ └── index.css
│ └── package.json
│
└── README.md
```


## Setup Instructions

### Prerequisites
- Node.js
- MongoDB (Local or Atlas)


### Backend

```bash
cd server
npm install
```

### Create .env file:

```bash
env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### Start server:

```bash
npm start
```
Backend runs on http://localhost:5000

### Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## API Endpoints

### Auth
POST /api/auth/register – Register user
POST /api/auth/login – Login

### Posts
GET /api/posts/feed – Get personalized feed
POST /api/posts – Create post
PUT /api/posts/:id/like – Like/Unlike post

### Users
PUT /api/users/:id/follow – Follow/Unfollow user

### Comments
POST /api/comments – Add comment

## Notes
- Only image URLs are used (no image upload)
- Extra features like stories or payments are not included
- Main focus is backend logic and feed implementation

# Author
Mrunali Kamerikar
