import { connectDB } from "@/lib/mongodb";
import { Post } from "@/model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";

// DELETE POST
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { userId } = await req.json();
        const { id: postId } = await params;

        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const post = await Post.findById(postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        // Only allow author to delete
        if (post.author.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Delete media from cloudinary
        if (post.media && post.media.length > 0) {
            for (const media of post.media) {
                if (media.publicId) {
                    try {
                        await cloudinary.uploader.destroy(media.publicId);
                    } catch (err) {
                        console.error("Error deleting image from cloudinary:", err);
                    }
                }
            }
        }

        // Delete post from database
        await Post.findByIdAndDelete(postId);

        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("DELETE /api/posts/[id] error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
