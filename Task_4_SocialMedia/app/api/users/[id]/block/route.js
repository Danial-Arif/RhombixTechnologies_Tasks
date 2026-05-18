import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// POST — block/unblock a user
export async function POST(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { userId } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        if (userId === id) {
            return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isBlocked = user.blockedUsers?.includes(id);

        if (isBlocked) {
            // Unblock
            await User.findByIdAndUpdate(userId, {
                $pull: { blockedUsers: id },
            });

            return NextResponse.json({
                message: "User unblocked",
                action: "unblocked",
            });
        } else {
            // Block — also remove from friends, following, followers
            await User.findByIdAndUpdate(userId, {
                $addToSet: { blockedUsers: id },
                $pull: {
                    friends: id,
                    following: id,
                    followers: id,
                    "friendRequests.sent": id,
                    "friendRequests.received": id,
                },
            });

            // Remove from target's lists too
            await User.findByIdAndUpdate(id, {
                $pull: {
                    friends: userId,
                    following: userId,
                    followers: userId,
                    "friendRequests.sent": userId,
                    "friendRequests.received": userId,
                },
            });

            return NextResponse.json({
                message: "User blocked",
                action: "blocked",
            });
        }
    } catch (err) {
        console.error("POST /api/users/[id]/block error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET — check if user is blocked
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
        }

        const user = await User.findById(userId).select("blockedUsers");
        const isBlocked = user?.blockedUsers?.includes(id) || false;

        return NextResponse.json({ isBlocked });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
