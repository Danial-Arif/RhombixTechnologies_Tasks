import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Song from "@/models/song";

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const artist = searchParams.get('artist');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 0; // 0 means no limit
        const skip = (page - 1) * limit;

        let query = {};
        if (artist) {
            query.artist = artist;
        }

        const totalSongs = await Song.countDocuments(query);
        const songs = await Song.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (!searchParams.get('page') && !searchParams.get('limit')) {
            return NextResponse.json(songs);
        }

        return NextResponse.json({
            songs,
            totalSongs,
            totalPages: limit > 0 ? Math.ceil(totalSongs / limit) : 1,
            currentPage: page
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to fetch songs" },
            { status: 500 }
        );
    }
}