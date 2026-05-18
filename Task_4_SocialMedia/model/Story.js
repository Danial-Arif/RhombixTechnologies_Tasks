import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
      index: true,
    },

    media: {
      url: {
        type: String,
        required: [true, "Story media URL is required"],
      },
      publicId: {
        type: String,
        default: "",
      },
      type: {
        type: String,
        enum: {
          values: ["image", "video"],
          message: "{VALUE} is not a valid story media type",
        },
        default: "image",
      },
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
StorySchema.index({ author: 1, createdAt: -1 });
// TTL index: automatically delete expired stories from MongoDB
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── Virtuals ─────────────────────────────────────────────────────────
StorySchema.virtual("viewersCount").get(function () {
  return this.viewers?.length || 0;
});

StorySchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

StorySchema.set("toJSON", { virtuals: true });
StorySchema.set("toObject", { virtuals: true });

const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);

export default Story;
