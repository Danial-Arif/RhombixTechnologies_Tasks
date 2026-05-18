import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      default: null, // null for OAuth users
    },

    image: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: [160, "Bio cannot exceed 160 characters"],
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: "",
    },

    website: {
      type: String,
      maxlength: [200, "Website URL cannot exceed 200 characters"],
      default: "",
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    friendRequests: {
      sent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      received: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavedPost",
      },
    ],

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Privacy Settings ────────────────────────────────────
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      showFollowers: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      showFollowing: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      showFriends: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      allowMessages: {
        type: String,
        enum: ["everyone", "friends", "nobody"],
        default: "everyone",
      },
      allowFriendRequests: {
        type: String,
        enum: ["everyone", "nobody"],
        default: "everyone",
      },
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: "text", username: "text" });
UserSchema.index({ isOnline: 1 });

// ── Virtuals ─────────────────────────────────────────────────────────
UserSchema.virtual("followersCount").get(function () {
  return this.followers?.length || 0;
});

UserSchema.virtual("followingCount").get(function () {
  return this.following?.length || 0;
});

UserSchema.virtual("friendsCount").get(function () {
  return this.friends?.length || 0;
});

// Ensure virtuals are included in JSON output
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.User;
}
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
