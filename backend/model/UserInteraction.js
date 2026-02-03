import mongoose from "mongoose";

/**
 * UserInteraction Model
 * Tracks user interactions with movies for personalized recommendations
 */
const userInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true
    },
    interactionType: {
      type: String,
      enum: ["view", "like", "share", "search", "click"],
      required: true
    },
    metadata: {
      watchTime: Number, // seconds
      scrollDepth: Number, // percentage
      deviceType: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    weight: {
      type: Number,
      default: 1 // Used for recommendation algorithm
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient queries
userInteractionSchema.index({ userId: 1, interactionType: 1 });
userInteractionSchema.index({ movieId: 1, interactionType: 1 });
userInteractionSchema.index({ userId: 1, createdAt: -1 });
userInteractionSchema.index({ "metadata.timestamp": -1 });

const UserInteraction = mongoose.model("UserInteraction", userInteractionSchema);

export default UserInteraction;
