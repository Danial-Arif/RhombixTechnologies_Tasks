'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle, Trash2, ArrowLeft, Music, Play } from 'lucide-react';
import Navbar from "@/components/navbar";
import { usePlayer } from '@/context/PlayerContext';
import Footer from "@/components/Footer";

export default function SinglePlaylistPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    const { currentSong, isPlaying, playSong, setQueue } = usePlayer();

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await fetch(`/api/playlist/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPlaylist(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPlaylist();
    }, [id]);

    const handlePlayAll = () => {
        if (!playlist || playlist.songs.length === 0) return;
        const firstSong = playlist.songs[0];
        setQueue(playlist.songs);
        router.push(`/Music/${firstSong._id}?play=true`);
    };

    const handlePlay = (song) => {
        setQueue(playlist.songs);
        router.push(`/Music/${song._id}?play=true`);
    };

    const handleRemoveSong = async (songId) => {
        try {
            const res = await fetch(`/api/playlist/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songId, action: 'remove' })
            });
            if (res.ok) {
                setPlaylist(prev => ({
                    ...prev,
                    songs: prev.songs.filter(s => s._id !== songId)
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!confirm('Are you sure you want to delete this playlist?')) return;
        try {
            const res = await fetch(`/api/playlist/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                router.push('/profile');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white md:ml-[260px]">
                <Navbar />
                <div className="flex h-64 items-center justify-center">
                    <p className="text-zinc-400">Loading playlist...</p>
                </div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-black text-white md:ml-[260px]">
                <Navbar />
                <div className="flex h-64 items-center justify-center">
                    <p className="text-zinc-400">Playlist not found.</p>
                </div>
            </div>
        );
    }

    const coverImage = playlist.coverImage || (playlist.songs && playlist.songs[0]?.coverImage);

    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px] overflow-y-auto scrollbar-hide">
            <Navbar />

            {/* Header Section */}
            <div className="flex flex-col items-end gap-6 bg-gradient-to-b from-zinc-800 to-black px-6 pb-8 pt-24 md:flex-row md:px-10">
                <button 
                    onClick={() => router.push('/profile')}
                    className="absolute left-6 top-6 flex items-center justify-center rounded-full bg-black/40 p-2 text-white hover:bg-black/60 md:left-10"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-xl bg-zinc-800 shadow-2xl">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={playlist.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600">
                            <Music size={64} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold uppercase text-white">Playlist</p>
                    <h1 className="text-4xl font-extrabold md:text-6xl">{playlist.title}</h1>
                    {playlist.description && (
                        <p className="mt-2 text-sm text-zinc-400">{playlist.description}</p>
                    )}
                    <p className="mt-2 text-sm text-zinc-300">
                        {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 px-6 py-6 md:px-10">
                <button 
                    onClick={handlePlayAll}
                    disabled={playlist.songs.length === 0}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6FFBBE] text-black shadow-lg transition hover:scale-105 disabled:opacity-50"
                >
                    <Play size={28} fill="currentColor" />
                </button>

                <button 
                    onClick={handleDeletePlaylist}
                    className="text-zinc-400 transition hover:text-red-500"
                >
                    Delete Playlist
                </button>
            </div>

            {/* Song List */}
            <div className="px-6 pb-32 md:px-10">
                {playlist.songs.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center justify-center py-10">
                        <p className="text-zinc-400">No songs in this playlist yet.</p>
                        <button 
                            onClick={() => router.push('/profile')}
                            className="mt-4 rounded-full border border-white/10 px-6 py-2 text-sm hover:bg-white/5"
                        >
                            Find songs to add
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {/* Header Row */}
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/10 px-4 py-2 text-sm font-semibold text-zinc-400">
                            <span className="w-8 text-center">#</span>
                            <span>Title</span>
                            <span>Action</span>
                        </div>

                        {/* Tracks */}
                        {playlist.songs.map((song, index) => (
                            <div 
                                key={song._id} 
                                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-white/5"
                            >
                                <div className="flex w-8 items-center justify-center text-zinc-400">
                                    <span className="group-hover:hidden">{index + 1}</span>
                                    <button 
                                        onClick={() => handlePlay(song)}
                                        className="hidden text-white group-hover:block"
                                    >
                                        <Play size={20} fill="currentColor" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="relative h-10 w-10 overflow-hidden rounded bg-zinc-800">
                                        <Image
                                            src={song.coverImage}
                                            alt={song.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-semibold ${currentSong?._id === song._id ? 'text-[#6FFBBE]' : 'text-white'}`}>
                                            {song.title}
                                        </span>
                                        <Link 
                                            href={`/artists/${encodeURIComponent(song.artist)}`}
                                            className="text-sm text-zinc-400 hover:text-[#6FFBBE] hover:underline"
                                        >
                                            {song.artist}
                                        </Link>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleRemoveSong(song._id)}
                                    className="opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
