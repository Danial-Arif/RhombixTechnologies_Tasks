'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/navbar";
import Image from 'next/image';
import { Play, Heart, Music } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import Footer from "@/components/Footer";

export default function LikedSongsPage() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setQueue } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        const fetchLikedSongs = async () => {
            try {
                const res = await fetch('/api/Liked');
                if (res.ok) {
                    const data = await res.json();
                    // data is array of { songId: { ...song... }, userId, ... }
                    setSongs(data.map(item => item.songId).filter(Boolean));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedSongs();
    }, []);

    const handlePlay = (song) => {
        setQueue(songs);
        router.push(`/Music/${song._id}?play=true`);
    };

    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px] overflow-y-auto scrollbar-hide">
            <Navbar />
            
            <div className="p-8">
                <div className="flex items-center gap-6 mb-10">
                    <div className="w-48 h-48 bg-gradient-to-br from-purple-700 to-blue-900 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Heart size={80} fill="white" className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">Playlist</p>
                        <h1 className="text-6xl font-black mt-2">Liked Songs</h1>
                        <p className="text-zinc-400 mt-4">{songs.length} songs</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Music size={48} className="animate-pulse text-zinc-700" />
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500 text-lg">No liked songs yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {songs.map((song, index) => (
                            <div 
                                key={song._id}
                                onClick={() => handlePlay(song)}
                                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer"
                            >
                                <span className="w-8 text-center text-zinc-500 group-hover:text-white">{index + 1}</span>
                                <div className="relative w-12 h-12 overflow-hidden rounded-md">
                                    <Image src={song.coverImage} alt={song.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold truncate">{song.title}</h3>
                                    <p className="text-sm text-zinc-400">{song.artist}</p>
                                </div>
                                <Heart size={18} fill="white" className="text-white" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
