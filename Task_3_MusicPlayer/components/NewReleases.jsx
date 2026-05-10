'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "../context/PlayerContext";
import { useRouter } from "next/navigation";

export default function NewReleases({ showSeeMore = false, limit = 0 }) {
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
                // We fetch songs which are already sorted by latest in the API
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
        <section className="mt-10 px-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                    New Releases
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
                <div className="flex flex-wrap gap-6">
                    {displayedSongs.map((song) => (
                        <div
                            onClick={() => handlePlay(song)}
                            key={song._id}
                            className="group flex flex-col gap-3 rounded-2xl bg-zinc-900/60 p-4 transition hover:bg-zinc-800 cursor-pointer"
                        >
                            <div className="relative h-25 w-25 md:h-35 md:w-35 overflow-hidden rounded-xl">
                                <Image
                                    src={song.coverImage}
                                    alt={song.title}
                                    fill
                                    className="object-cover transition group-hover:scale-105"
                                />
                            </div>

                            <div className="w-25 md:w-30">
                                <h2 className="truncate text-lg font-semibold text-white">
                                    {song.title}
                                </h2>

                                <Link
                                    href={`/artists/${encodeURIComponent(song.artist)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block truncate text-sm text-zinc-400 hover:text-[#6FFBBE] hover:underline"
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
