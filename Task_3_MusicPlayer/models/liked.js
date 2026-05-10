import mongoose from "mongoose";

const likedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },

    songId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Song",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

likedSchema.index({ userId: 1, songId: 1 }, { unique: true });

const Liked =
    mongoose.models.Liked || mongoose.model("Liked", likedSchema);

export default Liked;