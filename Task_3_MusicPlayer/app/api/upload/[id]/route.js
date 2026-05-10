import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Song from '@/models/song';


export async function DELETE(req, context) {
    try {
        await connectDB();

        const { id } = await context.params;

        const deletedSong = await Song.findByIdAndDelete(id);

        if (!deletedSong) {
            return NextResponse.json(
                { error: 'Song not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: 'Song deleted successfully',
                deletedSong,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete error:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}