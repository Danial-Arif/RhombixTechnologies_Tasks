import { connectDB } from "@/lib/mongodb";
import Conversation from "@/model/Conversation";
import User from "@/model/User";
import Message from "@/model/Message";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET — get all conversations for a user
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
        }

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate({
                path: "participants",
                model: User,
                select: "name username image isOnline",
            })
            .populate({
                path: "lastMessage",
                model: Message,
                populate: {
                    path: "sender",
                    model: User,
                    select: "name username image",
                },
            })
            .sort({ updatedAt: -1 });

        return NextResponse.json({ conversations });
    } catch (err) {
        console.error("GET /api/conversations error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST — create or get existing conversation
export async function POST(req) {
    try {
        await connectDB();
        const { userId, targetUserId } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, targetUserId] },
            isGroup: false,
        })
            .populate("participants", "name username image isOnline")
            .populate({
                path: "lastMessage",
                model: Message,
                populate: { path: "sender", model: User, select: "name username image" },
            });

        if (conversation) {
            return NextResponse.json({ conversation });
        }

        // Create new conversation
        conversation = await Conversation.create({
            participants: [userId, targetUserId],
        });

        // Populate for response
        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "name username image isOnline");

        return NextResponse.json({ conversation }, { status: 201 });
    } catch (err) {
        console.error("POST /api/conversations error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
