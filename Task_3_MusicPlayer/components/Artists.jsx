'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Artists({ limit: propLimit = 0, showPagination = false, showSeeMore = false }) {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                // Fetch with limit to get unique artists efficiently if possible, 
                // but since artists are derived from songs, we fetch songs.
                const url = propLimit > 0 || showPagination 
                    ? `/api/songs?page=${page}&limit=${propLimit || 50}` 
                    : "/api/songs";
                
                const res = await fetch(url);

                if (!res.ok) {
                    console.log("API Failed");
                    return;
                }

                const data = await res.json();
                
                if (data.songs) {
                    setSongs(data.songs);
                    setTotalPages(data.totalPages);
                } else {
                    setSongs(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [page, propLimit, showPagination]);

    // Remove duplicate artists
    const uniqueArtists = [
        ...new Map(
            songs.map((song) => [song.artist, song])
        ).values(),
    ];

    return (
        <section className="mt-10 px-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                    Artists
                </h1>
                {showSeeMore && (
                    <Link href="/artists" className="text-sm font-semibold text-[#6FFBBE] hover:underline">
                        See More
                    </Link>
                )}
            </div>

            {loading ? (
                <p className="text-zinc-400">Loading artists...</p>
            ) : uniqueArtists.length === 0 ? (
                <p className="text-zinc-400">No artists found.</p>
            ) : (
                <>
                    <div className="flex flex-wrap gap-6">
                        {uniqueArtists.map((song) => (
                            <Link
                                key={song.artist}
                                href={`/artists/${encodeURIComponent(song.artist)}`}
                                className="group flex flex-col items-center gap-3 rounded-md p-4 transition-colors hover:bg-zinc-800/60"
                            >
                                <Image
                                    width={128}
                                    height={128}
                                    className="h-32 w-32 rounded-full object-cover transition group-hover:scale-105"
                                    src={song.coverImage}
                                    alt={song.artist}
                                />

                                <div className="text-center">
                                    <p className="text-sm font-semibold text-white">
                                        {song.artist}
                                    </p>

                                    <p className="text-xs text-zinc-400">
                                        Artist
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {showPagination && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 pb-10">
                            <button 
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-full bg-zinc-900 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            
                            <span className="text-sm font-medium">Page {page} of {totalPages}</span>

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
        </section>
    );
}