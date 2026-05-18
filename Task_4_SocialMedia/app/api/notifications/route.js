import { connectDB } from "@/lib/mongodb";
import Notification from "@/model/Notification";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET — get notifications for a user
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const limit = parseInt(searchParams.get("limit")) || 30;
        const unreadOnly = searchParams.get("unreadOnly") === "true";

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
        }

        const filter = { recipient: userId };
        if (unreadOnly) {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .populate("sender", "name username image")
            .populate("post", "content")
            .sort({ createdAt: -1 })
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false,
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (err) {
        console.error("GET /api/notifications error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH — mark notifications as read
export async function PATCH(req) {
    try {
        await connectDB();
        const { userId, notificationIds, markAll } = await req.json();

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
        }

        if (markAll) {
            await Notification.updateMany(
                { recipient: userId, isRead: false },
                { $set: { isRead: true } }
            );
        } else if (notificationIds?.length) {
            await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    recipient: userId,
                },
                { $set: { isRead: true } }
            );
        }

        return NextResponse.json({ message: "Notifications marked as read" });
    } catch (err) {
        console.error("PATCH /api/notifications error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE — delete a notification
export async function DELETE(req) {
    try {
        await connectDB();
        const { userId, notificationId } = await req.json();

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
        }

        await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId,
        });

        return NextResponse.json({ message: "Notification deleted" });
    } catch (err) {
        console.error("DELETE /api/notifications error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
