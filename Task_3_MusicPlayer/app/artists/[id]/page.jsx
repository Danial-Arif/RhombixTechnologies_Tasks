'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Music, ArrowLeft, MoreHorizontal } from 'lucide-react';
import Navbar from "@/components/navbar";
import { usePlayer } from '@/context/PlayerContext';
import Footer from "@/components/Footer";

export default function ArtistPage() {
    const params = useParams();
    const router = useRouter();
    const artistName = params.id ? decodeURIComponent(params.id) : '';

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const { currentSong, isPlaying, playSong, setQueue } = usePlayer();

    useEffect(() => {
        const fetchArtistSongs = async () => {
            try {
                const res = await fetch(`/api/songs?artist=${encodeURIComponent(artistName)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSongs(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (artistName) fetchArtistSongs();
    }, [artistName]);

    const handlePlayAll = () => {
        if (songs.length === 0) return;
        const firstSong = songs[0];
        setQueue(songs);
        router.push(`/Music/${firstSong._id}?play=true`);
    };

    const handlePlay = (song) => {
        setQueue(songs);
        router.push(`/Music/${song._id}?play=true`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white md:ml-[260px]">
                <Navbar />
                <div className="flex h-64 items-center justify-center">
                    <p className="text-zinc-400">Loading artist...</p>
                </div>
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white md:ml-[260px]">
                <Navbar />
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Music size={48} className="text-zinc-600" />
                        <p className="text-zinc-400">No songs found for {artistName}.</p>
                        <button
                            onClick={() => router.back()}
                            className="text-sm text-[#6FFBBE] hover:underline"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Use the cover image of the first song as a representative artist image for now
    const artistImage = songs[0]?.coverImage;

    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px] overflow-y-auto scrollbar-hide">
            <Navbar />

            {/* Header Section */}
            <div className="relative flex flex-col items-end gap-6 bg-gradient-to-b from-zinc-800 to-black px-6 pb-8 pt-24 md:flex-row md:px-10">
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 top-6 flex items-center justify-center rounded-full bg-black/40 p-2 text-white hover:bg-black/60 md:left-10"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="relative aspect-square w-48 shrink-0 overflow-hidden rounded-full border-4 border-white/5 bg-zinc-800 shadow-2xl md:w-56">
                    {artistImage ? (
                        <Image
                            src={artistImage}
                            alt={artistName}
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
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                            ✓
                        </span>
                        <p className="text-sm font-semibold uppercase text-white/80">Verified Artist</p>
                    </div>
                    <h1 className="text-5xl font-black md:text-8xl tracking-tight">{artistName}</h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        {songs.length} {songs.length === 1 ? 'song' : 'songs'} uploaded
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 px-6 py-8 md:px-10">
                <button
                    onClick={handlePlayAll}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6FFBBE] text-black shadow-lg transition hover:scale-105 active:scale-95"
                >
                    <Play size={28} fill="currentColor" />
                </button>
                <button className="rounded-full border border-white/20 px-6 py-2 text-sm font-bold uppercase tracking-wider transition hover:border-white hover:bg-white/5">
                    Follow
                </button>
                <button className="text-zinc-400 transition hover:text-white">
                    <MoreHorizontal size={24} />
                </button>
            </div>

            {/* Song List */}
            <div className="px-6 pb-32 md:px-10">
                <h2 className="mb-6 text-2xl font-bold">Popular Tracks</h2>
                <div className="flex flex-col gap-2">
                    {/* Tracks */}
                    {songs.map((song, index) => (
                        <div
                            key={song._id}
                            onClick={() => handlePlay(song)}
                            className="group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-white/5"
                        >
                            <div className="flex w-8 items-center justify-center text-zinc-400">
                                <span className="group-hover:hidden">{index + 1}</span>
                                <Play size={16} fill="currentColor" className="hidden text-white group-hover:block" />
                            </div>

                            <div className="flex flex-1 items-center gap-4">
                                <div className="relative h-12 w-12 overflow-hidden rounded bg-zinc-800 shadow-lg">
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
                                    <span className="text-sm text-zinc-400">{song.artist}</span>
                                </div>
                            </div>

                            <div className="hidden text-sm text-zinc-500 md:block">
                                {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '3:45'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}