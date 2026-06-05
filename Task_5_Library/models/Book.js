import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, default: "Others" },
    coverImage: { type: String },
    pdfUrl: { type: String },
    uploadedBy: { type: String }, // User email (internal, for ownership checks)
    uploadedByName: { type: String },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Book || mongoose.model("Book", BookSchema);