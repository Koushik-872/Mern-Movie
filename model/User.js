import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email"
      ]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    interactionHistory: {
      viewedMovies: [
        {
          movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie"
          },
          viewedAt: {
            type: Date,
            default: Date.now
          },
          watchTime: {
            type: Number,
            default: 0 // in seconds
          }
        }
      ],
      likedMovies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Movie"
        }
      ],
      searchHistory: [
        {
          query: String,
          searchedAt: {
            type: Date,
            default: Date.now
          }
        }
      ],
      preferredGenres: [String],
      preferredDirectors: [String]
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Skip if password is not modified
  if (!this.isModified("password")) {
    return;
  }
  
  try {
    const SALT_ROUNDS = 10;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance
// Note: email and username are already indexed via unique: true
userSchema.index({ "interactionHistory.viewedMovies.movieId": 1 });

const User = mongoose.model("User", userSchema);

export default User;
