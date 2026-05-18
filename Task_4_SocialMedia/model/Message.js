import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation reference is required"],
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
      default: "",
    },

    media: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

// Ensure a message has either content or media
MessageSchema.pre("validate", function () {
  if (!this.content && (!this.media || !this.media.url)) {
    this.invalidate("content", "Message must have either content or media");
  }
});

// ── Middleware ────────────────────────────────────────────────────────
// Update the lastMessage field on the parent Conversation
MessageSchema.post("save", async function () {
  const Conversation = mongoose.model("Conversation");
  await Conversation.findByIdAndUpdate(this.conversation, {
    lastMessage: this._id,
  });
});

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
