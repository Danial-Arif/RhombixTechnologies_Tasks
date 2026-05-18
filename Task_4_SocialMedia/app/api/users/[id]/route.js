import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET — get user profile
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const viewerId = searchParams.get("viewerId"); // the user viewing the profile

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const user = await User.findById(id)
            .select("-password")
            .populate("followers", "name username image")
            .populate("following", "name username image")
            .populate("friends", "name username image");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isSelf = viewerId === id;
        const isFriend = viewerId && user.friends?.some(f => f._id.toString() === viewerId);
        const isFollowing = viewerId && user.followers?.some(f => f._id.toString() === viewerId);
        const isBlocked = viewerId && user.blockedUsers?.includes(viewerId);

        if (isBlocked) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Apply privacy settings
        const privacy = user.privacy || {};
        const profile = user.toObject();

        // Filter followers based on privacy
        if (!isSelf) {
            if (privacy.showFollowers === "nobody" ||
                (privacy.showFollowers === "friends" && !isFriend)) {
                profile.followers = [];
                profile.followersHidden = true;
            }
            if (privacy.showFollowing === "nobody" ||
                (privacy.showFollowing === "friends" && !isFriend)) {
                profile.following = [];
                profile.followingHidden = true;
            }
            if (privacy.showFriends === "nobody" ||
                (privacy.showFriends === "friends" && !isFriend)) {
                profile.friends = [];
                profile.friendsHidden = true;
            }
        }

        return NextResponse.json({
            user: profile,
            isSelf,
            isFriend: !!isFriend,
            isFollowing: !!isFollowing,
        });
    } catch (err) {
        console.error("GET /api/users/[id] error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH — update user profile or privacy settings
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const { userId, ...updates } = body;

        if (userId !== id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Whitelist allowed fields
        const allowed = ["name", "bio", "location", "website", "image", "coverImage", "privacy", "notificationsEnabled", "isPrivate"];
        const sanitized = {};
        for (const key of allowed) {
            if (updates[key] !== undefined) {
                if (key === "privacy") {
                    // Merge privacy settings
                    const user = await User.findById(id).select("privacy");
                    sanitized.privacy = { ...(user.privacy?.toObject?.() || user.privacy || {}), ...updates.privacy };
                } else {
                    sanitized[key] = updates[key];
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: sanitized },
            { new: true, runValidators: true }
        ).select("-password");

        return NextResponse.json({ user });
    } catch (err) {
        console.error("PATCH /api/users/[id] error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
