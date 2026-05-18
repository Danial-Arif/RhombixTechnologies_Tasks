import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    isGroup: {
      type: Boolean,
      default: false,
    },

    groupName: {
      type: String,
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
      default: "",
    },

    groupImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

// Require at least 2 participants
ConversationSchema.pre("validate", function () {
  if (!this.participants || this.participants.length < 2) {
    this.invalidate(
      "participants",
      "A conversation must have at least 2 participants"
    );
  }

  // Group conversations must have a name
  if (this.isGroup && !this.groupName) {
    this.invalidate("groupName", "Group conversations must have a name");
  }
});

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);

export default Conversation;
