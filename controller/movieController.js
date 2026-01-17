import Movie from "../model/Movie.js";
import User from "../model/User.js";
import UserInteraction from "../model/UserInteraction.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";
import { movieQueue } from "../utils/queue.js";
import {
  getPersonalizedFeed,
  getTrendingMovies
} from "../utils/recommendationEngine.js";

/**
 * @desc    Get all movies with pagination
 * @route   GET /api/movies
 * @access  Public
 */
export const getMovies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const movies = await Movie.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Movie.countDocuments();

  res.json({
    success: true,
    count: movies.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    data: movies
  });
});

/**
 * @desc    Get personalized movie feed (Instagram Reels style)
 * @route   GET /api/movies/feed
 * @access  Private
 */
export const getMovieFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const userId = req.user.id;

  // Get user's interaction history
  const user = await User.findById(userId);
  const userInteractions = user.interactionHistory || {
    preferredGenres: [],
    preferredDirectors: [],
    viewedMovies: []
  };

  // Get all user interactions for popularity calculation
  const allInteractions = await UserInteraction.find({
    "metadata.timestamp": {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  }).lean();

  // Get all movies
  const movies = await Movie.find().lean();

  // Get personalized feed
  const personalizedMovies = await getPersonalizedFeed(
    movies,
    userInteractions,
    allInteractions,
    limit
  );

  res.json({
    success: true,
    count: personalizedMovies.length,
    data: personalizedMovies
  });
});

/**
 * @desc    Get trending movies (Explore page style)
 * @route   GET /api/movies/trending
 * @access  Public
 */
export const getTrending = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  // Get all user interactions for trending calculation
  const allInteractions = await UserInteraction.find({
    "metadata.timestamp": {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  }).lean();

  // Get all movies
  const movies = await Movie.find().lean();

  // Get trending movies
  const trendingMovies = await getTrendingMovies(movies, allInteractions, limit);

  res.json({
    success: true,
    count: trendingMovies.length,
    data: trendingMovies
  });
});

/**
 * @desc    Get sorted movies
 * @route   GET /api/movies/sorted
 * @access  Public
 */
export const getSortedMovies = asyncHandler(async (req, res) => {
  const { sortBy = "rating", order = "desc" } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Validate sortBy field
  const validSortFields = ["title", "rating", "releaseDate", "duration"];
  if (!validSortFields.includes(sortBy)) {
    throw new ApiError(400, `Invalid sort field. Allowed: ${validSortFields.join(", ")}`);
  }

  // Build sort object
  const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;
  const sortObject = { [sortBy]: sortOrder };

  const movies = await Movie.find()
    .sort(sortObject)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Movie.countDocuments();

  res.json({
    success: true,
    count: movies.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total
    },
    sortBy,
    order,
    data: movies
  });
});

/**
 * @desc    Search movies by name or description
 * @route   GET /api/movies/search
 * @access  Public
 */
export const searchMovies = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!q) {
    throw new ApiError(400, "Please provide a search query");
  }

  // Track search interaction if user is authenticated
  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        "interactionHistory.searchHistory": {
          query: q,
          searchedAt: new Date()
        }
      }
    });
  }

  // Text search using MongoDB text index
  const movies = await Movie.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .skip(skip)
    .limit(limit)
    .lean();

  // Fallback: if text search returns no results, use regex search
  let fallbackMovies = [];
  if (movies.length === 0) {
    const searchRegex = new RegExp(q, "i");
    fallbackMovies = await Movie.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  const results = movies.length > 0 ? movies : fallbackMovies;
  const total = results.length;

  res.json({
    success: true,
    count: results.length,
    query: q,
    data: results
  });
});

/**
 * @desc    Get single movie by ID
 * @route   GET /api/movies/:id
 * @access  Public
 */
export const getMovieById = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  // Track view interaction if user is authenticated
  if (req.user) {
    await UserInteraction.create({
      userId: req.user.id,
      movieId: movie._id,
      interactionType: "view",
      metadata: {
        timestamp: new Date()
      }
    });

    // Update user's viewed movies and preferences
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: {
        "interactionHistory.viewedMovies": {
          movieId: movie._id,
          viewedAt: new Date()
        },
        "interactionHistory.preferredGenres": { $each: movie.genre },
        "interactionHistory.preferredDirectors": movie.director
      }
    });
  }

  res.json({
    success: true,
    data: movie
  });
});

/**
 * @desc    Create new movie (Admin only)
 * @route   POST /api/movies
 * @access  Private/Admin
 */
export const createMovie = asyncHandler(async (req, res) => {
  const movieData = {
    ...req.body,
    createdBy: req.user.id
  };

  // Use queue for lazy insertion (for batch operations)
  // For single movie creation, we can insert directly
  const movie = await Movie.create(movieData);

  res.status(201).json({
    success: true,
    data: movie
  });
});

/**
 * @desc    Create multiple movies using queue (Admin only)
 * @route   POST /api/movies/batch
 * @access  Private/Admin
 */
export const createMoviesBatch = asyncHandler(async (req, res) => {
  const { movies } = req.body;

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new ApiError(400, "Please provide an array of movies");
  }

  // Add movies to queue for lazy insertion
  movies.forEach(movieData => {
    movieQueue.enqueue(
      { ...movieData, createdBy: req.user.id },
      async (data) => {
        await Movie.create(data);
      }
    );
  });

  res.status(202).json({
    success: true,
    message: `${movies.length} movies added to queue for processing`,
    queueStatus: movieQueue.getStatus()
  });
});

/**
 * @desc    Update movie (Admin only)
 * @route   PUT /api/movies/:id
 * @access  Private/Admin
 */
export const updateMovie = asyncHandler(async (req, res) => {
  let movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: movie
  });
});

/**
 * @desc    Delete movie (Admin only)
 * @route   DELETE /api/movies/:id
 * @access  Private/Admin
 */
export const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  await movie.deleteOne();

  res.json({
    success: true,
    message: "Movie deleted successfully"
  });
});

/**
 * @desc    Track user interaction with movie
 * @route   POST /api/movies/:id/interaction
 * @access  Private
 */
export const trackInteraction = asyncHandler(async (req, res) => {
  const { interactionType, metadata } = req.body;
  const { id } = req.params;

  const validTypes = ["view", "like", "share", "click"];
  if (!validTypes.includes(interactionType)) {
    throw new ApiError(400, `Invalid interaction type. Allowed: ${validTypes.join(", ")}`);
  }

  const movie = await Movie.findById(id);
  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  // Create interaction record
  const interaction = await UserInteraction.create({
    userId: req.user.id,
    movieId: id,
    interactionType,
    metadata: {
      ...metadata,
      timestamp: new Date()
    }
  });

  // Update user preferences based on interaction
  if (interactionType === "like") {
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: {
        "interactionHistory.likedMovies": id,
        "interactionHistory.preferredGenres": { $each: movie.genre },
        "interactionHistory.preferredDirectors": movie.director
      }
    });
  }

  res.status(201).json({
    success: true,
    data: interaction
  });
});
