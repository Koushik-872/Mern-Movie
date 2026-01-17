# Project Structure & File Organization

## 📁 Complete File Structure

```
MERN MOVIE/
├── server/                          # Backend Server
│   ├── config/                      # Configuration files
│   │   └── db.js                    # MongoDB connection setup
│   │
│   ├── controller/                  # Business logic controllers
│   │   ├── authController.js        # Authentication (register, login, getMe)
│   │   └── movieController.js       # Movie CRUD & interactions
│   │
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # JWT authentication & authorization
│   │   └── cors.js                  # CORS configuration
│   │
│   ├── model/                       # Mongoose schemas
│   │   ├── Movie.js                 # Movie model with indexes
│   │   ├── User.js                  # User model with interaction history
│   │   └── UserInteraction.js       # Interaction tracking model
│   │
│   ├── route/                       # API route definitions
│   │   ├── authRoutes.js            # Auth endpoints
│   │   └── movieRoutes.js           # Movie endpoints
│   │
│   ├── utils/                       # Utility functions
│   │   ├── errorHandler.js          # Error handling utilities
│   │   ├── queue.js                 # Queue system for lazy insertion
│   │   └── recommendationEngine.js  # Recommendation algorithm
│   │
│   ├── .env.example                 # Environment variables template
│   ├── package.json                 # Dependencies & scripts
│   ├── server.js                    # Main server entry point
│   ├── README.md                    # Project documentation
│   ├── ARCHITECTURE.md              # Architecture & algorithm docs
│   └── PROJECT_STRUCTURE.md         # This file
│
└── client/                          # Frontend (React)
    └── (frontend files)
```

## 📋 File Descriptions

### Configuration (`config/`)

#### `db.js`
- MongoDB connection using Mongoose
- Error handling and connection status logging
- Exports `connectDb()` function

### Controllers (`controller/`)

#### `authController.js`
- **register**: Create new user account
- **login**: Authenticate user and return JWT
- **getMe**: Get current logged-in user details

#### `movieController.js`
- **getMovies**: Get all movies with pagination
- **getMovieFeed**: Personalized feed (Instagram Reels style)
- **getTrending**: Trending movies (Explore page style)
- **getSortedMovies**: Sort movies by various fields
- **searchMovies**: Search by title/description
- **getMovieById**: Get single movie + track view
- **createMovie**: Create new movie (Admin)
- **createMoviesBatch**: Batch create via queue (Admin)
- **updateMovie**: Update movie (Admin)
- **deleteMovie**: Delete movie (Admin)
- **trackInteraction**: Track user interactions

### Middleware (`middleware/`)

#### `auth.js`
- **protect**: Verify JWT token (required for protected routes)
- **authorize**: Role-based access control (Admin only)
- **optionalAuth**: Optional authentication (works with or without token)

#### `cors.js`
- CORS configuration
- Whitelist frontend URLs
- Credentials support

### Models (`model/`)

#### `Movie.js`
- Movie schema with validation
- Indexes for: text search, rating, date, duration, genre
- References to creator (User)

#### `User.js`
- User authentication schema
- Password hashing (pre-save hook)
- Interaction history tracking
- Preferred genres/directors
- Role-based access (user/admin)

#### `UserInteraction.js`
- Tracks all user interactions
- Types: view, like, share, click, search
- Metadata storage (watch time, scroll depth)
- Indexes for efficient queries

### Routes (`route/`)

#### `authRoutes.js`
```
POST   /api/auth/register  → register
POST   /api/auth/login     → login
GET    /api/auth/me        → getMe (protected)
```

#### `movieRoutes.js`
```
# Public Routes
GET    /api/movies              → getMovies
GET    /api/movies/trending     → getTrending
GET    /api/movies/sorted       → getSortedMovies
GET    /api/movies/search       → searchMovies (optional auth)
GET    /api/movies/:id          → getMovieById (optional auth)

# Private Routes
GET    /api/movies/feed         → getMovieFeed (protected)
POST   /api/movies/:id/interaction → trackInteraction (protected)

# Admin Routes
POST   /api/movies              → createMovie (admin)
POST   /api/movies/batch        → createMoviesBatch (admin)
PUT    /api/movies/:id          → updateMovie (admin)
DELETE /api/movies/:id          → deleteMovie (admin)
```

### Utils (`utils/`)

#### `errorHandler.js`
- **ApiError**: Custom error class
- **errorHandler**: Centralized error middleware
- **asyncHandler**: Wrapper for async route handlers

#### `queue.js`
- **MovieQueue**: Queue system for batch operations
- Batch processing (10 items at a time)
- Retry mechanism (3 attempts)
- Auto-processing with intervals

#### `recommendationEngine.js`
- **calculateRecommendationScore**: Calculate movie score
- **getPersonalizedFeed**: Instagram Reels style feed
- **getTrendingMovies**: Explore page style trending
- Weight-based algorithm (genre, director, rating, popularity, recency)

### Root Files

#### `server.js`
- Express app initialization
- Middleware setup
- Route mounting
- Error handling
- Server startup

#### `package.json`
- Dependencies: express, mongoose, jwt, bcrypt, cors
- Scripts: start, dev
- ES modules configuration

## 🔄 Data Flow

### User Registration Flow
```
POST /api/auth/register
  ↓
authController.register
  ↓
User.create (hashes password)
  ↓
Generate JWT token
  ↓
Return user + token
```

### Movie Feed Flow (Personalized)
```
GET /api/movies/feed (with JWT)
  ↓
protect middleware (verify token)
  ↓
movieController.getMovieFeed
  ↓
Get user interaction history
  ↓
Get all interactions (for popularity)
  ↓
Get all movies
  ↓
recommendationEngine.getPersonalizedFeed
  ↓
Calculate scores for each movie
  ↓
Sort by score & return top N
```

### Movie Creation Flow (Admin)
```
POST /api/movies (with JWT)
  ↓
protect middleware (verify token)
  ↓
authorize middleware (check admin role)
  ↓
movieController.createMovie
  ↓
Movie.create
  ↓
Return created movie
```

## 🎯 Key Features by File

| File | Key Features |
|------|--------------|
| `Movie.js` | Text search, performance indexes |
| `User.js` | Password hashing, interaction tracking |
| `UserInteraction.js` | Comprehensive interaction tracking |
| `recommendationEngine.js` | Multi-factor recommendation algorithm |
| `queue.js` | Batch processing, retry logic |
| `errorHandler.js` | Centralized error management |
| `auth.js` | JWT verification, role-based access |

## 📊 Database Relationships

```
User (1) ──→ (Many) Movie (createdBy)
User (1) ──→ (Many) UserInteraction
Movie (1) ──→ (Many) UserInteraction
```

## 🚀 Scalability Points

1. **Database Indexes**: Optimized queries
2. **Queue System**: Handles concurrent insertions
3. **Lean Queries**: Faster read operations
4. **Pagination**: Limits result sets
5. **Modular Structure**: Easy to scale individual components

## 📝 Code Quality Features

- ✅ Consistent error handling
- ✅ Input validation
- ✅ Security best practices (JWT, bcrypt)
- ✅ Code comments and documentation
- ✅ Separation of concerns
- ✅ Reusable utilities
- ✅ Environment-based configuration
