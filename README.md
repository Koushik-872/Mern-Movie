#  **SERVER SIDE README**

This client depends on the backend server:
Mern-Movie (Server)

Make sure the server is running before using the client.

# Scripts:
Command	Description
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
# Notes:
Update VITE_API_BASE_URL when deploying
Do not push .env file to GitHub

# MERN Movie Application – Server

This is the **backend (server side)** of the MERN Movie Application.
It is built using **Node.js, Express.js, and MongoDB** and provides APIs for movies, users, reviews, and authentication.

---
# Features
- User authentication using JWT
- Movie CRUD operations
- Reviews management
- Favorites management
- Secure protected routes
- MongoDB database connection

---

# Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (Authentication)
- dotenv
- CORS

---

# Folder Structure
server/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── server.js
└── package.json


---

# Installation & Setup

# 1️ Clone the Repository
```bash
git clone https://github.com/Koushik-872/Mern-Movie.git
cd Mern-Movie
# 2️ Install Dependencies
npm install
# 3️ Create Environment File
Create a .env file in the root folder and add:
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# 4️ Start the Server
  npm run dev
# Server will run on:
http://localhost:5000

# API Base URL
http://localhost:5000/api
# Sample API Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Register user
POST	/api/auth/login	Login user
GET	/api/movies	Get all movies
GET	/api/movies/:id	Get movie by ID
POST	/api/reviews	Add review
POST	/api/favorites	Add to favorites

# Security Notes
Do NOT push .env to GitHub
Use strong JWT secret
Validate inputs properly
