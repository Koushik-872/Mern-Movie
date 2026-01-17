/**
 * Recommendation Engine
 * Implements Instagram Reels/Explore-style algorithm for personalized movie recommendations
 * Based on user interactions, preferences, and collaborative filtering
 */

/**
 * Calculate recommendation score for a movie based on user interactions
 */
export const calculateRecommendationScore = (movie, userInteractions, allInteractions) => {
  let score = 0;

  // 1. Genre Preference (40% weight)
  const genreWeight = calculateGenreWeight(movie.genre, userInteractions);
  score += genreWeight * 0.4;

  // 2. Director Preference (20% weight)
  const directorWeight = calculateDirectorWeight(movie.director, userInteractions);
  score += directorWeight * 0.2;

  // 3. Rating (15% weight)
  const ratingWeight = (movie.rating / 10) * 0.15;
  score += ratingWeight;

  // 4. Recent Popularity (10% weight)
  const popularityWeight = calculatePopularity(movie, allInteractions);
  score += popularityWeight * 0.1;

  // 5. Recency (10% weight)
  const recencyWeight = calculateRecency(movie.releaseDate);
  score += recencyWeight * 0.1;

  // 6. User Interaction History (5% weight)
  const interactionWeight = calculateInteractionWeight(movie._id, userInteractions);
  score += interactionWeight * 0.05;

  return Math.min(score, 1.0); // Normalize to 0-1
};

/**
 * Calculate weight based on user's genre preferences
 */
const calculateGenreWeight = (movieGenres, userInteractions) => {
  if (!userInteractions.preferredGenres || userInteractions.preferredGenres.length === 0) {
    return 0.5; // Neutral if no preference data
  }

  const matchingGenres = movieGenres.filter(genre =>
    userInteractions.preferredGenres.some(pref => 
      pref.toLowerCase() === genre.toLowerCase()
    )
  ).length;

  return Math.min(matchingGenres / movieGenres.length, 1.0);
};

/**
 * Calculate weight based on user's director preferences
 */
const calculateDirectorWeight = (movieDirector, userInteractions) => {
  if (!userInteractions.preferredDirectors || userInteractions.preferredDirectors.length === 0) {
    return 0.5;
  }

  const likedDirectors = userInteractions.preferredDirectors.map(d => d.toLowerCase());
  return likedDirectors.includes(movieDirector.toLowerCase()) ? 1.0 : 0.3;
};

/**
 * Calculate popularity based on recent interactions
 */
const calculatePopularity = (movie, allInteractions) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentInteractions = allInteractions.filter(
    interaction =>
      interaction.movieId.toString() === movie._id.toString() &&
      interaction.metadata?.timestamp >= sevenDaysAgo
  ).length;

  // Normalize: 0-100 interactions = 0-1 score
  return Math.min(recentInteractions / 100, 1.0);
};

/**
 * Calculate recency weight (newer movies get higher score)
 */
const calculateRecency = (releaseDate) => {
  const now = new Date();
  const release = new Date(releaseDate);
  const yearsDiff = (now - release) / (1000 * 60 * 60 * 24 * 365);

  // Movies from last 5 years get highest score, older movies get lower
  if (yearsDiff <= 5) return 1.0;
  if (yearsDiff <= 10) return 0.7;
  if (yearsDiff <= 20) return 0.5;
  return 0.3;
};

/**
 * Calculate weight based on user's previous interactions
 * Penalize movies user has already viewed
 */
const calculateInteractionWeight = (movieId, userInteractions) => {
  const viewed = userInteractions.viewedMovies?.some(
    v => v.movieId.toString() === movieId.toString()
  );
  
  if (viewed) return 0.1; // Low score for already viewed
  return 0.8; // Higher score for unseen movies
};

/**
 * Get personalized movie feed (like Instagram Reels)
 * Returns movies sorted by recommendation score
 */
export const getPersonalizedFeed = (movies, userInteractions, allInteractions, limit = 20) => {
  // Calculate scores for all movies
  const moviesWithScores = movies.map(movie => ({
    movie,
    score: calculateRecommendationScore(movie, userInteractions, allInteractions)
  }));

  // Sort by score (descending) and limit
  return moviesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.movie);
};

/**
 * Get trending movies (like Explore page)
 * Based on recent interactions and ratings
 */
export const getTrendingMovies = (movies, allInteractions, limit = 20) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const moviesWithTrendingScore = movies.map(movie => {
    const recentInteractions = allInteractions.filter(
      interaction =>
        interaction.movieId.toString() === movie._id.toString() &&
        interaction.metadata?.timestamp >= sevenDaysAgo
    ).length;

    // Combine rating and recent interactions
    const trendingScore = (movie.rating / 10) * 0.5 + Math.min(recentInteractions / 50, 1.0) * 0.5;

    return {
      movie,
      trendingScore
    };
  });

  return moviesWithTrendingScore
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
    .map(item => item.movie);
};
