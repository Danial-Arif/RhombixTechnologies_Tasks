import { connectDB } from "@/lib/mongodb";
import { Post, User } from "@/model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Add comment
export async function POST(req, { params }) {
    try {
        await connectDB();

        const { userId, content } = await req.json();
        const { id: postId } = await params;

        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        if (!content?.trim()) {
            return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: { author: userId, content } } },
            { new: true }
        ).populate("comments.author", "name username image");

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        const newComment = post.comments[post.comments.length - 1];

        return NextResponse.json({ comment: newComment }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Delete comment
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const { userId, commentId } = await req.json();
        const { id: postId } = await params;

        const post = await Post.findByIdAndUpdate(
            postId,
            { $pull: { comments: { _id: commentId, author: userId } } }, // author check prevents deleting others' comments
            { new: true }
        );

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        return NextResponse.json({ message: "Comment deleted" });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}