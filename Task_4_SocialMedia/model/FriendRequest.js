import mongoose from "mongoose";

/**
 * Enum: friend request status
 */
const FRIEND_REQUEST_STATUS = ["pending", "accepted", "rejected"];

const FriendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: FRIEND_REQUEST_STATUS,
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
// Prevent duplicate friend requests between the same pair
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
FriendRequestSchema.index({ receiver: 1, status: 1 });

// Prevent users from sending friend requests to themselves
FriendRequestSchema.pre("validate", function () {
  if (this.sender && this.receiver && this.sender.equals(this.receiver)) {
    this.invalidate("receiver", "Cannot send a friend request to yourself");
  }
});

const FriendRequest =
  mongoose.models.FriendRequest ||
  mongoose.model("FriendRequest", FriendRequestSchema);

export { FRIEND_REQUEST_STATUS };
export default FriendRequest;
