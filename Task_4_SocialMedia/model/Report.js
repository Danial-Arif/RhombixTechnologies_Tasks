import mongoose from "mongoose";

/**
 * Enum: report reasons
 */
const REPORT_REASONS = [
  "spam",
  "harassment",
  "hate_speech",
  "violence",
  "nudity",
  "misinformation",
  "copyright",
  "other",
];

/**
 * Enum: report status
 */
const REPORT_STATUS = ["pending", "reviewed", "resolved", "dismissed"];

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
      index: true,
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    targetPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    targetComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    reason: {
      type: String,
      enum: {
        values: REPORT_REASONS,
        message: "{VALUE} is not a valid report reason",
      },
      required: [true, "Report reason is required"],
    },

    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: REPORT_STATUS,
        message: "{VALUE} is not a valid report status",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────────────────
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reporter: 1 });
ReportSchema.index({ targetUser: 1 });
ReportSchema.index({ targetPost: 1 });

// Ensure at least one target is specified
ReportSchema.pre("validate", function () {
  if (!this.targetUser && !this.targetPost && !this.targetComment) {
    this.invalidate(
      "targetUser",
      "A report must target at least one entity (user, post, or comment)"
    );
  }
});

const Report =
  mongoose.models.Report || mongoose.model("Report", ReportSchema);

export { REPORT_REASONS, REPORT_STATUS };
export default Report;
