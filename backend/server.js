import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDb } from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";
import { corsOptions } from "./middleware/cors.js";
import authRoutes from "./route/authRoutes.js";
import movieRoutes from "./route/movieRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MERN Movie API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      movies: "/api/movies"
    }
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB
connectDb();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});
