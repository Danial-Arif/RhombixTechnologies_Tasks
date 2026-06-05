import mongoose from "mongoose";

const BorrowRecordSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // User email/username from session
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    borrowedAt: { type: Date, default: Date.now },
    returnedAt: { type: Date },
    status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" }
});

export default mongoose.models.BorrowRecord || mongoose.model("BorrowRecord", BorrowRecordSchema);
