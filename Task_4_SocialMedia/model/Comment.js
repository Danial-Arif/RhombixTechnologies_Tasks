import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post reference is required"],
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },

    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });
CommentSchema.index({ author: 1 });

// ── Virtuals ─────────────────────────────────────────────────────────
CommentSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

CommentSchema.set("toJSON", { virtuals: true });
CommentSchema.set("toObject", { virtuals: true });

// ── Middleware ────────────────────────────────────────────────────────
// Increment commentsCount on associated Post when a new comment is created
CommentSchema.post("save", async function () {
  const Post = mongoose.model("Post");
  await Post.findByIdAndUpdate(this.post, { $inc: { commentsCount: 1 } });
});

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

export default Comment;
