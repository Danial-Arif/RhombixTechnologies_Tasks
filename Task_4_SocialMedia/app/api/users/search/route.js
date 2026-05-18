import { connectDB } from "@/lib/mongodb";
import { User } from "@/model";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");
        const userId = searchParams.get("userId");

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ users: [] });
        }

        const users = await User.find({
            _id: { $ne: userId }, // exclude self
            $or: [
                { name: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
            ],
        })
            .select("name username image")
            .limit(10);

        return NextResponse.json({ users });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}