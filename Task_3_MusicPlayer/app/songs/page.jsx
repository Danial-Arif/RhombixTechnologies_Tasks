'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/navbar";
import Image from 'next/image';
import { Music, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import Footer from "@/components/Footer";

export default function SongsPage() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSongs, setTotalSongs] = useState(0);
    const limit = 10;

    const { setQueue } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        const fetchSongs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/songs?page=${page}&limit=${limit}`);
                if (res.ok) {
                    const data = await res.json();
                    setSongs(data.songs);
                    setTotalPages(data.totalPages);
                    setTotalSongs(data.totalSongs);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [page]);

    const handlePlay = (song) => {
        setQueue(songs);
        router.push(`/Music/${song._id}?play=true`);
    };

    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px]">
            <Navbar />
            
            <div className="p-8 pb-32">
                <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight mb-2">All Songs</h1>
                    <p className="text-zinc-500">{totalSongs} tracks available</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Music size={48} className="animate-pulse text-zinc-700" />
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500 text-lg">No songs found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {songs.map((song) => (
                                <div 
                                    key={song._id}
                                    onClick={() => handlePlay(song)}
                                    className="group bg-zinc-900/40 p-4 rounded-2xl hover:bg-zinc-800 transition cursor-pointer"
                                >
                                    <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
                                        <Image src={song.coverImage} alt={song.title} fill className="object-cover transition group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-[#6FFBBE] flex items-center justify-center text-black shadow-lg">
                                                <Play fill="currentColor" size={24} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold truncate">{song.title}</h3>
                                    <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <button 
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-full bg-zinc-900 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-full text-sm font-bold transition ${
                                                page === i + 1 
                                                ? 'bg-[#6FFBBE] text-black' 
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-full bg-zinc-900 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </>
                )}
                <Footer />
            </div>
        </div>
    );
}
