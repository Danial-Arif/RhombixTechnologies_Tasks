import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Playlist from '@/models/playlist';

export async function GET(req, context) {
    try {
        await connectDB();
        const { id } = await context.params;

        const playlist = await Playlist.findById(id).populate('songs');

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
        }

        return NextResponse.json(playlist);
    } catch (error) {
        console.error('Fetch playlist error:', error);
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }
}

export async function PUT(req, context) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await req.json();
        const { songId, action } = body; // action can be 'add' or 'remove'

        if (!songId || !action) {
            return NextResponse.json({ error: 'Song ID and action are required' }, { status: 400 });
        }

        const playlist = await Playlist.findOne({ _id: id, owner: session.user.id });

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
        }

        if (action === 'add') {
            if (!playlist.songs.includes(songId)) {
                playlist.songs.push(songId);
            }
        } else if (action === 'remove') {
            playlist.songs = playlist.songs.filter(sId => sId.toString() !== songId);
        }

        await playlist.save();
        return NextResponse.json(playlist);
    } catch (error) {
        console.error('Update playlist error:', error);
        return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        const playlist = await Playlist.findOneAndDelete({ _id: id, owner: session.user.id });

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Playlist deleted' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
    }
}
