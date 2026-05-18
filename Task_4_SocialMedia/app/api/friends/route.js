import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import Notification from "@/model/Notification";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { emitToUser } from "@/lib/socket-emit";

// GET — get friends list + incoming/sent requests
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
        }

        const user = await User.findById(userId)
            .populate("friends", "name username image isOnline")
            .populate("friendRequests.sent", "name username image")
            .populate("friendRequests.received", "name username image")
            .select("friends friendRequests");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            friends: user.friends || [],
            sent: user.friendRequests?.sent || [],
            received: user.friendRequests?.received || [],
        });
    } catch (err) {
        console.error("GET /api/friends error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST — send friend request
export async function POST(req) {
    try {
        await connectDB();
        const { userId, targetId } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        if (userId === targetId) {
            return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
        }

        const [user, target] = await Promise.all([
            User.findById(userId),
            User.findById(targetId),
        ]);

        if (!user || !target) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if blocked
        if (user.blockedUsers?.includes(targetId) || target.blockedUsers?.includes(userId)) {
            return NextResponse.json({ error: "Cannot send request" }, { status: 403 });
        }

        // Check privacy settings
        if (target.privacy?.allowFriendRequests === "nobody") {
            return NextResponse.json({ error: "This user does not accept friend requests" }, { status: 403 });
        }

        // Already friends
        if (user.friends?.includes(targetId)) {
            return NextResponse.json({ error: "Already friends" }, { status: 400 });
        }

        // Request already sent
        if (user.friendRequests?.sent?.includes(targetId)) {
            return NextResponse.json({ error: "Request already sent" }, { status: 400 });
        }

        // If target already sent you a request → auto accept
        if (user.friendRequests?.received?.includes(targetId)) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { friends: targetId },
                $pull: { "friendRequests.received": targetId },
            });
            await User.findByIdAndUpdate(targetId, {
                $addToSet: { friends: userId },
                $pull: { "friendRequests.sent": userId },
            });

            // Create notification
            await Notification.create({
                recipient: targetId,
                sender: userId,
                type: "friend_request",
            });

            // Notify via socket
            const acceptorInfo = await User.findById(userId).select("name username image");
            emitToUser(targetId, "friend_accepted", { userId, acceptor: acceptorInfo });

            return NextResponse.json({ message: "Friend request accepted (mutual)" });
        }

        // Send request
        await User.findByIdAndUpdate(userId, {
            $addToSet: { "friendRequests.sent": targetId },
        });
        await User.findByIdAndUpdate(targetId, {
            $addToSet: { "friendRequests.received": userId },
        });

        // Create notification
        await Notification.create({
            recipient: targetId,
            sender: userId,
            type: "friend_request",
        });

        // Notify target via socket
        const senderInfo = await User.findById(userId).select("name username image");
        emitToUser(targetId, "friend_request", { sender: senderInfo });
        emitToUser(targetId, "new_notification", {
            notification: { type: "friend_request", sender: senderInfo },
        });

        return NextResponse.json({ message: "Friend request sent" });
    } catch (err) {
        console.error("POST /api/friends error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH — accept or decline request
export async function PATCH(req) {
    try {
        await connectDB();
        const { userId, targetId, action } = await req.json(); // action: "accept" | "decline"

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        if (action === "accept") {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { friends: targetId },
                $pull: { "friendRequests.received": targetId },
            });
            await User.findByIdAndUpdate(targetId, {
                $addToSet: { friends: userId },
                $pull: { "friendRequests.sent": userId },
            });

            // Create notification
            await Notification.create({
                recipient: targetId,
                sender: userId,
                type: "friend_request",
            });

            const acceptorInfo = await User.findById(userId).select("name username image");
            emitToUser(targetId, "friend_accepted", { userId, acceptor: acceptorInfo });
            emitToUser(targetId, "new_notification", {
                notification: { type: "friend_request", sender: acceptorInfo, message: "accepted your friend request" },
            });

            return NextResponse.json({ message: "Friend request accepted" });
        }

        if (action === "decline") {
            await User.findByIdAndUpdate(userId, {
                $pull: { "friendRequests.received": targetId },
            });
            await User.findByIdAndUpdate(targetId, {
                $pull: { "friendRequests.sent": userId },
            });

            return NextResponse.json({ message: "Friend request declined" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        console.error("PATCH /api/friends error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — unfriend
export async function DELETE(req) {
    try {
        await connectDB();
        const { userId, targetId } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await User.findByIdAndUpdate(userId, { $pull: { friends: targetId } });
        await User.findByIdAndUpdate(targetId, { $pull: { friends: userId } });

        return NextResponse.json({ message: "Unfriended successfully" });
    } catch (err) {
        console.error("DELETE /api/friends error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}