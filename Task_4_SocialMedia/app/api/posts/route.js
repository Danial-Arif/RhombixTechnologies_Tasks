import { Post, User } from "@/model";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// CREATE POST
export async function POST(req) {
    try {
        await connectDB();

        const formData = await req.formData();
        const content = formData.get("content") || "";
        const userId = formData.get("userId");
        const mediaFile = formData.get("media");

        // Validate userId presence
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        // Validate at least content or media is provided
        if (!content.trim() && (!mediaFile || mediaFile.size === 0)) {
            return NextResponse.json(
                { error: "Content or media is required" },
                { status: 400 }
            );
        }

        let mediaArray = [];

        if (mediaFile && mediaFile.size > 0) {
            // Server-side file validation
            if (!ALLOWED_TYPES.includes(mediaFile.type)) {
                return NextResponse.json(
                    { error: "Only JPEG, PNG, WebP, and GIF files are allowed" },
                    { status: 400 }
                );
            }
            if (mediaFile.size > MAX_SIZE) {
                return NextResponse.json(
                    { error: "File size must be under 5MB" },
                    { status: 400 }
                );
            }

            const arrayBuffer = await mediaFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString("base64");
            const fileUri = `data:${mediaFile.type};base64,${base64Data}`;

            const uploadRes = await cloudinary.uploader.upload(fileUri, {
                folder: "social_media_posts",
            });

            mediaArray.push({
                url: uploadRes.secure_url,
                publicId: uploadRes.public_id,
            });
        }

        const post = await Post.create({
            content,
            media: mediaArray,
            author: userId,
        });

        return NextResponse.json({ post }, { status: 201 });
    } catch (err) {
        console.error("POST /api/posts error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

// GET FEED
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const limit = parseInt(searchParams.get("limit")) || 10;
        const page = parseInt(searchParams.get("page")) || 1;
        const skip = (page - 1) * limit;

        const query = userId ? { author: userId } : {};

        const posts = await Post.find(query)
            .populate({
                path: "author",
                model: User,
                select: "name username image",
            })
            .populate({
                path: "comments.author",
                model: User,
                select: "name username image",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json(
            { posts, page, limit },
            { status: 200 }
        );
    } catch (err) {
        console.error("GET /api/posts error:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}