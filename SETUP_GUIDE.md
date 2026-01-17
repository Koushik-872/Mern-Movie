# Quick Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/moviedb?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 4. Test the API

The server will run on `http://localhost:5000`

Test the health endpoint:
```bash
GET http://localhost:5000
```

## 📝 Creating Your First Admin User

1. **Register a user:**
   ```bash
   POST http://localhost:5000/api/auth/register
   Content-Type: application/json

   {
     "username": "admin",
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```

2. **Update user role to admin** (via MongoDB or add admin registration endpoint):
   - Connect to MongoDB
   - Find the user document
   - Update `role` field to `"admin"`

   Or use MongoDB Compass/Shell:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## 🎬 Adding Movies

### Single Movie (Admin)
```bash
POST http://localhost:5000/api/movies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "The Shawshank Redemption",
  "description": "Two imprisoned men bond over a number of years...",
  "releaseDate": "1994-09-23",
  "duration": 142,
  "rating": 9.3,
  "genre": ["Drama"],
  "director": "Frank Darabont",
  "cast": ["Tim Robbins", "Morgan Freeman"],
  "posterUrl": "https://example.com/poster.jpg"
}
```

### Batch Movies (Using Queue)
```bash
POST http://localhost:5000/api/movies/batch
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "movies": [
    {
      "title": "Movie 1",
      "description": "Description 1",
      ...
    },
    {
      "title": "Movie 2",
      "description": "Description 2",
      ...
    }
  ]
}
```

## 🔍 Testing the Recommendation Algorithm

1. **Register and login as a user**

2. **View some movies** (tracks interactions):
   ```bash
   GET http://localhost:5000/api/movies/:id
   Authorization: Bearer <user_token>
   ```

3. **Like some movies**:
   ```bash
   POST http://localhost:5000/api/movies/:id/interaction
   Authorization: Bearer <user_token>
   Content-Type: application/json

   {
     "interactionType": "like"
   }
   ```

4. **Get personalized feed**:
   ```bash
   GET http://localhost:5000/api/movies/feed?limit=20
   Authorization: Bearer <user_token>
   ```

5. **Compare with trending**:
   ```bash
   GET http://localhost:5000/api/movies/trending?limit=20
   ```

## 🧪 API Testing Tools

Use any of these tools:
- **Postman**: Import collection or create requests manually
- **Thunder Client**: VS Code extension
- **cURL**: Command line
- **Insomnia**: API testing client

## 📊 Common API Calls

### Public Endpoints

```bash
# Get all movies
GET /api/movies?page=1&limit=10

# Search movies
GET /api/movies/search?q=inception

# Sort movies
GET /api/movies/sorted?sortBy=rating&order=desc

# Get trending
GET /api/movies/trending?limit=20

# Get single movie
GET /api/movies/:id
```

### Protected Endpoints (Require JWT)

```bash
# Get personalized feed
GET /api/movies/feed?limit=20
Authorization: Bearer <token>

# Track interaction
POST /api/movies/:id/interaction
Authorization: Bearer <token>
Content-Type: application/json
{
  "interactionType": "like"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Admin Endpoints (Require Admin Role)

```bash
# Create movie
POST /api/movies
Authorization: Bearer <admin_token>

# Update movie
PUT /api/movies/:id
Authorization: Bearer <admin_token>

# Delete movie
DELETE /api/movies/:id
Authorization: Bearer <admin_token>
```

## 🔐 Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Include token** in `Authorization` header: `Bearer <token>`
3. **Token expires** after 30 days (configurable)

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check `MONGO_URI` in `.env`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify network connection

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Token must be included in `Authorization` header
- Token format: `Bearer <token>`

### CORS Errors
- Update `FRONTEND_URL` in `.env`
- Check `middleware/cors.js` for allowed origins

### Port Already in Use
- Change `PORT` in `.env`
- Kill process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill
  ```

## 📦 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGO_URI=<your_production_mongodb_uri>
JWT_SECRET=<strong_random_secret>
FRONTEND_URL=<your_frontend_url>
```

### Recommended Platforms
- **Backend**: Railway, Render, Heroku, AWS Elastic Beanstalk
- **Database**: MongoDB Atlas (free tier available)
- **Frontend**: Vercel, Netlify

### Security Checklist
- ✅ Strong `JWT_SECRET`
- ✅ MongoDB Atlas with IP whitelist
- ✅ CORS properly configured
- ✅ Environment variables secured
- ✅ Error messages sanitized in production

## 📚 Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Configure `.env` file
3. ✅ Start the server
4. ✅ Create admin user
5. ✅ Add movies
6. ✅ Test recommendation algorithm
7. ✅ Connect frontend
8. ✅ Deploy to production

## 💡 Tips

- Use `npm run dev` during development for auto-reload
- Check server logs for debugging
- Use Postman collection for easy API testing
- Monitor MongoDB Atlas for database performance
- Test recommendation algorithm with multiple users

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- Review `ARCHITECTURE.md` for algorithm details
- See `PROJECT_STRUCTURE.md` for file organization
- Check server console logs for errors
