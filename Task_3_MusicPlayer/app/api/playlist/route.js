import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Playlist from '@/models/playlist';

export async function GET(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const playlists = await Playlist.find({ owner: session.user.id })
            .populate('songs')
            .sort({ createdAt: -1 });

        return NextResponse.json(playlists);
    } catch (error) {
        console.error('Fetch playlists error:', error);
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const playlist = await Playlist.create({
            title,
            description,
            owner: session.user.id,
            songs: [],
        });

        return NextResponse.json(playlist, { status: 201 });
    } catch (error) {
        console.error('Create playlist error:', error);
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
