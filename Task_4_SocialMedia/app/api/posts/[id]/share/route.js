import { connectDB } from "@/lib/mongodb";
import { Post } from "@/model";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    try {
        await connectDB();

        const { id } = await params;
        
        // Just increment a sharesCount field (add it to your schema)
        const post = await Post.findByIdAndUpdate(
            id,
            { $inc: { sharesCount: 1 } },
            { new: true }
        );

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        return NextResponse.json({ sharesCount: post.sharesCount });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}