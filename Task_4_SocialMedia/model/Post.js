import mongoose from "mongoose";

/**
 * Enum: allowed media types for post attachments
 */
const MEDIA_TYPES = ["image", "video", "gif", "audio"];


const VISIBILITY_OPTIONS = ["public", "friends", "private"];

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },

    content: {
      type: String,
      maxlength: [5000, "Post content cannot exceed 5000 characters"],
      default: "",
    },

    media: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    mediaType: {
      type: String,
      enum: {
        values: MEDIA_TYPES,
        message: "{VALUE} is not a valid media type",
      },
      default: "image",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    visibility: {
      type: String,
      enum: {
        values: VISIBILITY_OPTIONS,
        message: "{VALUE} is not a valid visibility option",
      },
      default: "public",
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    mentions: [
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
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ visibility: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ content: "text" });

// ── Virtuals ─────────────────────────────────────────────────────────
PostSchema.virtual("likesCount").get(function () {
  return this.likes?.length || 0;
});

PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

// Ensure a post has either content or media
PostSchema.pre("validate", function () {
  if (!this.content && (!this.media || this.media.length === 0)) {
    this.invalidate("content", "Post must have either content or media");
  }
});

delete mongoose.models.Post;
const Post = mongoose.model("Post", PostSchema);

export { MEDIA_TYPES, VISIBILITY_OPTIONS };
export default Post;
