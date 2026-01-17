# MERN Movie Application - Backend Server

A comprehensive MERN stack movie application backend with role-based access control, personalized recommendations, and Instagram Reels-style interaction-based algorithms.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Secure password hashing with bcrypt

- **Movie Management**
  - CRUD operations for movies
  - Search movies by name or description
  - Sort movies by title, rating, release date, or duration
  - Pagination support

- **Personalized Recommendations**
  - Instagram Reels-style personalized feed based on user interactions
  - Explore page-style trending movies
  - Algorithm considers:
    - Genre preferences
    - Director preferences
    - User interaction history
    - Movie ratings and popularity
    - Recent releases

- **User Interaction Tracking**
  - Track views, likes, shares, and clicks
  - Store user preferences automatically
  - Build personalized recommendation profiles

- **Performance & Scalability**
  - Distributed queue system for lazy data insertion
  - Database indexes for optimized queries
  - Efficient batch processing
  - Concurrent request handling

- **Error Handling**
  - Centralized error handling
  - Meaningful error messages
  - Development vs production error responses

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controller/
│   ├── authController.js     # Authentication logic
│   └── movieController.js    # Movie CRUD and interaction logic
├── middleware/
│   ├── auth.js               # JWT authentication & authorization
│   └── cors.js               # CORS configuration
├── model/
│   ├── Movie.js              # Movie schema
│   ├── User.js               # User schema with interaction history
│   └── UserInteraction.js    # User interaction tracking schema
├── route/
│   ├── authRoutes.js         # Authentication routes
│   └── movieRoutes.js        # Movie routes
├── utils/
│   ├── errorHandler.js       # Error handling utilities
│   ├── queue.js              # Queue system for lazy insertion
│   └── recommendationEngine.js # Recommendation algorithm
├── .env.example              # Environment variables template
├── package.json
├── server.js                 # Main server file
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret key for JWT tokens
   - `FRONTEND_URL`: Your frontend URL (for CORS)

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |

### Movie Routes (`/api/movies`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all movies (paginated) |
| GET | `/feed` | Private | Get personalized movie feed |
| GET | `/trending` | Public | Get trending movies |
| GET | `/sorted` | Public | Get sorted movies |
| GET | `/search?q=query` | Public | Search movies |
| GET | `/:id` | Public | Get movie by ID |
| POST | `/` | Admin | Create new movie |
| POST | `/batch` | Admin | Create multiple movies (queued) |
| PUT | `/:id` | Admin | Update movie |
| DELETE | `/:id` | Admin | Delete movie |
| POST | `/:id/interaction` | Private | Track user interaction |

## 📝 API Usage Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Personalized Feed (Instagram Reels Style)
```bash
GET /api/movies/feed?limit=20
Authorization: Bearer <token>
```

### Get Trending Movies (Explore Page Style)
```bash
GET /api/movies/trending?limit=20
```

### Search Movies
```bash
GET /api/movies/search?q=inception&page=1&limit=10
```

### Sort Movies
```bash
GET /api/movies/sorted?sortBy=rating&order=desc&page=1&limit=10
```

### Create Movie (Admin)
```bash
POST /api/movies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Inception",
  "description": "A mind-bending thriller",
  "releaseDate": "2010-07-16",
  "duration": 148,
  "rating": 8.8,
  "genre": ["Action", "Sci-Fi", "Thriller"],
  "director": "Christopher Nolan",
  "cast": ["Leonardo DiCaprio", "Marion Cotillard"],
  "posterUrl": "https://example.com/poster.jpg"
}
```

### Track Interaction
```bash
POST /api/movies/:id/interaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "interactionType": "like",
  "metadata": {
    "watchTime": 120,
    "scrollDepth": 80
  }
}
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎯 Recommendation Algorithm

The personalized feed algorithm uses:

1. **Genre Preference (40%)**: Based on user's viewed/liked movies
2. **Director Preference (20%)**: Based on user's liked directors
3. **Movie Rating (15%)**: IMDB-style rating (0-10 scale)
4. **Recent Popularity (10%)**: Based on interactions in last 7 days
5. **Recency (10%)**: Newer movies get higher scores
6. **Interaction History (5%)**: Penalizes already-viewed movies

## 🔄 Queue System

The queue system handles batch movie insertions efficiently:

- Processes movies in batches of 10
- Automatic retry mechanism (3 retries)
- Non-blocking asynchronous processing
- Ideal for importing large datasets from IMDb

## 🗄️ Database Models

### User Model
- Authentication fields (username, email, password)
- Role (user/admin)
- Interaction history (viewed movies, liked movies, preferences)

### Movie Model
- Movie details (title, description, rating, etc.)
- Indexes for performance (text search, rating, date)
- Reference to creator (admin)

### UserInteraction Model
- Tracks all user interactions with movies
- Metadata for analytics
- Used for recommendation algorithm

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGO_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<strong_random_secret>
FRONTEND_URL=<your_frontend_url>
```

### Recommended Platforms

- **Backend**: Heroku, AWS Elastic Beanstalk, Railway, Render
- **Database**: MongoDB Atlas
- **Frontend**: Vercel, Netlify

## 🧪 Testing

Test the API using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Note**: Make sure to set up your MongoDB Atlas cluster and update the `MONGO_URI` in your `.env` file before running the server.
