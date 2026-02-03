import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    releaseDate: {
      type: Date,
      required: true
    },

    duration: {
      type: Number, 
      required: true
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },

    genre: {
      type: [String],
      required: true
    },

    director: {
      type: String,
      required: true
    },

    cast: {
      type: [String],
      default: []
    },

    posterUrl: {
      type: String,
      required: true
    },

    imdbId: {
      type: String,
      unique: true,
      sparse: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance optimization
movieSchema.index({ title: "text", description: "text" }); // Text search
movieSchema.index({ rating: -1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ duration: 1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ title: 1 });

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
