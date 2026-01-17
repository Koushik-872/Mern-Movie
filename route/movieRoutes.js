import express from "express";
import {
  getMovies,
  getMovieFeed,
  getTrending,
  getSortedMovies,
  searchMovies,
  getMovieById,
  createMovie,
  createMoviesBatch,
  updateMovie,
  deleteMovie,
  trackInteraction
} from "../controller/movieController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getMovies);
router.get("/trending", getTrending);
router.get("/sorted", getSortedMovies);
router.get("/search", optionalAuth, searchMovies);
router.get("/:id", optionalAuth, getMovieById);

// Protected routes (require authentication)
router.get("/feed", protect, getMovieFeed);
router.post("/:id/interaction", protect, trackInteraction);

// Admin routes (require authentication and admin role)
router.post("/", protect, authorize("admin"), createMovie);
router.post("/batch", protect, authorize("admin"), createMoviesBatch);
router.put("/:id", protect, authorize("admin"), updateMovie);
router.delete("/:id", protect, authorize("admin"), deleteMovie);

export default router;
