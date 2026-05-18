import mongoose from "mongoose";

const SavedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
// Prevent duplicate saves of the same post by the same user
SavedPostSchema.index({ user: 1, post: 1 }, { unique: true });
SavedPostSchema.index({ user: 1, createdAt: -1 });

const SavedPost =
  mongoose.models.SavedPost || mongoose.model("SavedPost", SavedPostSchema);

export default SavedPost;
