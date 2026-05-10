import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Song from '@/models/song';

export async function GET(req, context) {
    try {
        await connectDB();
        const { id } = await context.params;

        const song = await Song.findById(id);

        if (!song) {
            return NextResponse.json({ error: 'Song not found' }, { status: 404 });
        }

        return NextResponse.json(song);
    } catch (error) {
        console.error('Fetch song error:', error);
        return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 });
    }
}
