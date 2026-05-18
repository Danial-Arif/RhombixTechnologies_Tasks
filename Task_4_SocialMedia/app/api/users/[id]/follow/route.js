import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import Notification from "@/model/Notification";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { emitToUser } from "@/lib/socket-emit";

// POST — follow/unfollow a user
export async function POST(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { userId } = await req.json(); // the user performing the action

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        if (userId === id) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        const [user, targetUser] = await Promise.all([
            User.findById(userId),
            User.findById(id),
        ]);

        if (!user || !targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if blocked
        if (user.blockedUsers?.includes(id) || targetUser.blockedUsers?.includes(userId)) {
            return NextResponse.json({ error: "Cannot follow this user" }, { status: 403 });
        }

        const isFollowing = user.following?.includes(id);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(userId, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: userId } });

            return NextResponse.json({
                message: "Unfollowed successfully",
                action: "unfollowed",
            });
        } else {
            // Follow
            await User.findByIdAndUpdate(userId, { $addToSet: { following: id } });
            await User.findByIdAndUpdate(id, { $addToSet: { followers: userId } });

            // Create notification
            await Notification.create({
                recipient: id,
                sender: userId,
                type: "follow",
            });

            // Real-time notification
            const followerInfo = await User.findById(userId).select("name username image");
            emitToUser(id, "new_notification", {
                notification: {
                    type: "follow",
                    sender: followerInfo,
                    createdAt: new Date(),
                },
            });

            return NextResponse.json({
                message: "Followed successfully",
                action: "followed",
            });
        }
    } catch (err) {
        console.error("POST /api/users/[id]/follow error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
