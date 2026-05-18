import { connectDB } from "@/lib/mongodb";
import Message from "@/model/Message";
import Conversation from "@/model/Conversation";
import User from "@/model/User";
import Notification from "@/model/Notification";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { emitToUser } from "@/lib/socket-emit";

// GET — get messages for a conversation
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit")) || 50;
        const before = searchParams.get("before"); // cursor for pagination

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
        }

        const filter = { conversation: id };
        if (before) {
            filter.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(filter)
            .populate("sender", "name username image")
            .sort({ createdAt: 1 })
            .limit(limit);

        return NextResponse.json({ messages });
    } catch (err) {
        console.error("GET /api/conversations/[id]/messages error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST — send a message
export async function POST(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
        }

        const formData = await req.formData();
        const senderId = formData.get("senderId");
        const content = formData.get("content") || "";
        const mediaFile = formData.get("media");

        if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
            return NextResponse.json({ error: "Invalid senderId" }, { status: 400 });
        }

        // Verify conversation exists and user is a participant
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        if (!conversation.participants.some(p => p.toString() === senderId)) {
            return NextResponse.json({ error: "Not a participant" }, { status: 403 });
        }

        // Handle media upload
        let mediaData = {};
        if (mediaFile && mediaFile.size > 0) {
            const arrayBuffer = await mediaFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString("base64");
            const fileUri = `data:${mediaFile.type};base64,${base64Data}`;

            const uploadRes = await cloudinary.uploader.upload(fileUri, {
                folder: "social_media_messages",
                resource_type: "auto",
            });

            mediaData = {
                url: uploadRes.secure_url,
                publicId: uploadRes.public_id,
            };
        }

        // Create message
        const message = await Message.create({
            conversation: id,
            sender: senderId,
            content: content.trim(),
            media: mediaData.url ? mediaData : undefined,
        });

        // Populate sender for response
        await message.populate("sender", "name username image");

        // Create notification for other participants
        const otherParticipants = conversation.participants.filter(
            p => p.toString() !== senderId
        );

        for (const recipientId of otherParticipants) {
            await Notification.create({
                recipient: recipientId,
                sender: senderId,
                type: "message",
            });

            // Real-time notification
            emitToUser(recipientId.toString(), "new_message", {
                conversationId: id,
                message,
            });
        }

        return NextResponse.json({ message }, { status: 201 });
    } catch (err) {
        console.error("POST /api/conversations/[id]/messages error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
