import { connectDB } from "@/lib/mongodb";
import Liked from "@/models/liked";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { songId } = await req.json();

    const userId = session.user.id || session.user.email;

    const existing = await Liked.findOne({ userId, songId });

    if (existing) {
        await Liked.deleteOne({ _id: existing._id });

        return Response.json({
            message: "Unliked",
            liked: false,
        });
    } else {
        // LIKE
        await Liked.create({
            userId,
            songId,
        });

        return Response.json({
            message: "Liked",
            liked: true,
        });
    }
}
export async function GET() {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;

    const likedSongs = await Liked.find({ userId })
        .populate("songId");

    return Response.json(likedSongs);
}