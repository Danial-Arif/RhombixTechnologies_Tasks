import { connectDB } from "@/lib/mongodb";
import { Post, User, Notification } from "@/model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { emitToUser } from "@/lib/socket-emit";

export async function POST(req, { params }) {
    try {
        await connectDB();

        const { userId } = await req.json();
        const { id: postId } = await params;

        if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const post = await Post.findById(postId);
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        const alreadyLiked = post.likes.some(id => id.toString() === userId);

        // Toggle like
        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        // Create notification on new like (if not liking own post)
        if (!alreadyLiked && post.author.toString() !== userId) {
            const newNotif = await Notification.create({
                recipient: post.author,
                sender: userId,
                type: "like",
                post: postId,
            });

            const senderInfo = await User.findById(userId).select("name username image");
            emitToUser(post.author.toString(), "new_notification", {
                notification: {
                    _id: newNotif._id,
                    type: "like",
                    sender: senderInfo,
                    post: postId,
                    createdAt: newNotif.createdAt,
                },
            });
        }

        return NextResponse.json({
            liked: !alreadyLiked,
            likesCount: post.likes.length,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}