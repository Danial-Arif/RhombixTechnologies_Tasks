'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useRouter } from "next/navigation";

export default function RecentlyPlayed({ showSeeMore = false }) {
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
                const res = await fetch("/api/songs?limit=6");

                if (!res.ok) {
                    console.log("API Failed");
                    return;
                }

                const data = await res.json();
                if (data.songs) {
                    setSongs(data.songs);
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
    }, []);

    return (
        <div className="w-screen h-full flex flex-col flex-wrap py-5 px-10 gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Recently Played</h1>
                {showSeeMore && (
                    <Link href="/songs" className="text-sm font-semibold text-[#6FFBBE] hover:underline">
                        See More
                    </Link>
                )}
            </div>

            {loading ? (
                <p className="text-zinc-400">Loading...</p>
            ) : songs.length === 0 ? (
                <p className="text-zinc-400">No recent songs.</p>
            ) : (
                <div className="flex flew-wrap gap-6">
                    {songs.map((song) => (
                        <div
                            key={song._id}
                            onClick={() => handlePlay(song)}
                            className="flex flex-col gap-4 min-w-[128px] cursor-pointer group"
                        >
                            <div className="relative h:20 w:20 md:w-32 md:h-32 overflow-hidden rounded-md">
                                <Image
                                    fill
                                    className="object-cover transition group-hover:scale-105"
                                    src={song.coverImage}
                                    alt={song.title}
                                />
                            </div>
                            <p className="text-white text-sm font-semibold truncate w-20 md:w-32">{song.title}</p>
                            <p className="text-zinc-400 text-xs truncate w:20 md:w-32">{song.artist}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
