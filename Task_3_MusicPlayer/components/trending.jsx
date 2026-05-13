'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "../context/PlayerContext";
import { useRouter } from "next/navigation";

export default function Trending({ showSeeMore = false, limit = 0 }) {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setQueue } = usePlayer();
    const router = useRouter();

    const handlePlay = (song) => {
        setQueue(songs);
        router.push(`/Music/${song._id}?play=true`);
    };

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const res = await fetch("/api/songs");

                if (!res.ok) {
                    console.log("API Failed");
                    return;
                }

                const data = await res.json();
                setSongs(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const displayedSongs = limit > 0 ? songs.slice(0, limit) : songs;

    return (
        <section className="mt-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Trending Music
                </h1>
                {showSeeMore && (
                    <Link href="/songs" className="text-sm font-semibold text-[#6FFBBE] hover:underline">
                        See More
                    </Link>
                )}
            </div>

            {loading ? (
                <p className="text-zinc-400">Loading songs...</p>
            ) : displayedSongs.length === 0 ? (
                <p className="text-zinc-400">
                    No songs available.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {displayedSongs.map((song) => (
                        <div
                            onClick={() => handlePlay(song)}
                            key={song._id}
                            className="group flex flex-col gap-3 rounded-2xl bg-zinc-900/60 p-3 sm:p-4 transition hover:bg-zinc-800 cursor-pointer min-w-0"
                        >
                            <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                                <Image
                                    src={song.coverImage}
                                    alt={song.title}
                                    fill
                                    className="object-cover transition group-hover:scale-105"
                                />
                            </div>

                            <div className="min-w-0 flex flex-col gap-1">
                                <h2 className="truncate text-base sm:text-lg font-semibold text-white">
                                    {song.title}
                                </h2>

                                <Link 
                                    href={`/artists/${encodeURIComponent(song.artist)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block truncate text-xs sm:text-sm text-zinc-400 hover:text-[#6FFBBE] hover:underline"
                                >
                                    {song.artist}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
