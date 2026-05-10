import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Song from "@/models/song";

async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
}
export async function POST(req) {
    try {
        await connectDB(); // 🔥 THIS FIXES YOUR ERROR

        const formData = await req.formData();

        const title = formData.get("title");
        const artist = formData.get("artist");
        const cover = formData.get("cover_image");
        const audio = formData.get("audio_file");

        if (!cover || !audio) {
            return NextResponse.json(
                { error: "Files missing" },
                { status: 400 }
            );
        }

        const coverBuffer = Buffer.from(await cover.arrayBuffer());
        const audioBuffer = Buffer.from(await audio.arrayBuffer());

        const coverUpload = await uploadToCloudinary(coverBuffer, "covers");
        const audioUpload = await uploadToCloudinary(audioBuffer, "songs");

        const song = await Song.create({
            title,
            artist,
            coverImage: coverUpload.secure_url,
            audioFile: audioUpload.secure_url,
            duration: 0,
        });

        return NextResponse.json(song);
    } catch (error) {
        console.error("Upload error:", error);

        return NextResponse.json(
            { error: "Failed to upload song" },
            { status: 500 }
        );
    }
}
export async function DELETE(req, { params }) {
    try {
        await connectDB();

        const song = await Song.findByIdAndDelete(params.id);

        if (!song) {
            return NextResponse.json(
                { error: "Song not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Song deleted successfully", song },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete error:", error);

        return NextResponse.json(
            { error: "Failed to delete song" },
            { status: 500 }
        );
    }
}