'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/navbar";
import Image from 'next/image';
import { Search as SearchIcon, Music } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useRouter } from 'next/navigation';
import Footer from "@/components/Footer";

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setQueue } = usePlayer();
    const router = useRouter();

    useEffect(() => {
        const searchSongs = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // We use our existing /api/songs and filter locally, 
                // or we could add a search param to the API.
                // Let's use the API with a search param (standard behavior).
                const res = await fetch('/api/songs');
                if (res.ok) {
                    const data = await res.json();
                    const filtered = data.filter(song => 
                        song.title.toLowerCase().includes(query.toLowerCase()) ||
                        song.artist.toLowerCase().includes(query.toLowerCase())
                    );
                    setResults(filtered);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchSongs, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handlePlay = (song) => {
        setQueue(results);
        router.push(`/Music/${song._id}?play=true`);
    };

    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px] overflow-y-auto scrollbar-hide">
            <Navbar />
            
            <div className="p-8">
                <div className="relative mb-10">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={24} />
                    <input 
                        type="text"
                        placeholder="Search for songs or artists..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full max-w-2xl bg-zinc-900 border-none rounded-full py-4 pl-14 pr-6 text-lg focus:ring-2 focus:ring-[#6FFBBE] outline-none"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Music size={48} className="animate-pulse text-zinc-700" />
                    </div>
                ) : results.length === 0 && query ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-500 text-lg">No results found for &quot;{query}&quot;</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {results.map((song) => (
                            <div 
                                key={song._id}
                                onClick={() => handlePlay(song)}
                                className="group bg-zinc-900/40 p-4 rounded-2xl hover:bg-zinc-800 transition cursor-pointer"
                            >
                                <div className="relative aspect-square mb-4 overflow-hidden rounded-xl">
                                    <Image src={song.coverImage} alt={song.title} fill className="object-cover" />
                                </div>
                                <h3 className="font-bold truncate">{song.title}</h3>
                                <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
