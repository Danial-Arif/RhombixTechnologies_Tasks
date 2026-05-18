import mongoose from "mongoose";

/**
 * Enum: notification types
 */
const NOTIFICATION_TYPES = [
  "like",
  "comment",
  "follow",
  "message",
  "mention",
  "friend_request",
];

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: "{VALUE} is not a valid notification type",
      },
      required: [true, "Notification type is required"],
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export { NOTIFICATION_TYPES };
export default Notification;
