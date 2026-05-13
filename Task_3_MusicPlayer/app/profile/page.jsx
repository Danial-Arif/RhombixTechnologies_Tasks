'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
    PlayCircle,
    PauseCircle,
    Trash2,
    PlusCircle,
    Plus,
    Music,
    X
} from 'lucide-react';

import { usePlayer } from '@/context/PlayerContext';
import Navbar from '@/components/navbar';
import About from '@/components/about';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import Footer from '@/components/Footer';

export default function Profile() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [songs, setSongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(true);
    
    const [playlists, setPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(true);
    const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
    const [playlistForm, setPlaylistForm] = useState({ title: '', description: '' });

    const [deleteId, setDeleteId] = useState(null);
    const [addToPlaylistId, setAddToPlaylistId] = useState(null);

    const { currentSong, isPlaying, playSong, setQueue } = usePlayer();

    // Check if user is authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Fetch songs
    useEffect(() => {
        let isMounted = true;
        const fetchSongs = async () => {
            try {
                const res = await fetch('/api/songs');
                if (!res.ok) throw new Error('Failed to fetch songs');
                const data = await res.json();
                if (isMounted) setSongs(data);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                if (isMounted) setLoadingSongs(false);
            }
        };
        fetchSongs();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const res = await fetch('/api/playlist');
                if (res.ok) {
                    const data = await res.json();
                    setPlaylists(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingPlaylists(false);
            }
        };
        fetchPlaylists();
    }, []);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/playlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playlistForm)
            });
            if (res.ok) {
                setShowCreatePlaylistModal(false);
                setPlaylistForm({ title: '', description: '' });
                fetchPlaylists(); // Refresh playlists
            }
        } catch (error) {
            console.error(error);
        }
    };

    const del = async (id) => {
        try {
            const res = await fetch(`/api/upload/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(await res.text() || 'Delete failed');
            setSongs((prev) => prev.filter((song) => song._id !== id));
            setDeleteId(null);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handlePlay = (song) => {
        setQueue(songs);
        router.push(`/Music/${song._id}?play=true`);
    };

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-zinc-400">Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            <Navbar />

            <main className="h-screen md:ml-[260px] overflow-y-auto pb-28 scrollbar-hide">
                <About />

                <section className="px-6 py-8 md:px-10">
                    
                    {/* Playlists Section */}
                    <div className="mb-14">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-xl font-bold">Your Playlists</h1>
                            <button
                                onClick={() => setShowCreatePlaylistModal(true)}
                                className="flex items-center gap-2 rounded-full bg-[#6FFBBE] px-4 py-2 text-sm font-semibold text-black transition hover:scale-105"
                            >
                                <Plus size={16} />
                                New Playlist
                            </button>
                        </div>

                        {loadingPlaylists ? (
                            <p className="text-zinc-400">Loading playlists...</p>
                        ) : playlists.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/40 py-10">
                                <Music size={32} className="mb-4 text-zinc-600" />
                                <p className="text-zinc-400">No playlists yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {playlists.map(playlist => (
                                    <Link href={`/playlist/${playlist._id}`} key={playlist._id}>
                                        <div className="group rounded-2xl bg-zinc-900/40 p-4 transition hover:bg-zinc-800">
                                            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-zinc-800">
                                                {playlist.coverImage || (playlist.songs && playlist.songs[0]?.coverImage) ? (
                                                    <Image
                                                        src={playlist.coverImage || playlist.songs[0].coverImage}
                                                        alt={playlist.title}
                                                        fill
                                                        className="object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                                                        <Music size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="truncate font-semibold">{playlist.title}</h3>
                                            <p className="truncate text-xs text-zinc-400">
                                                {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Songs Section */}
                    <div>
                        <h1 className="mb-6 text-xl font-bold">Recently Uploaded</h1>

                        {loadingSongs ? (
                            <p className="text-zinc-400">Loading songs...</p>
                        ) : songs.length === 0 ? (
                            <p className="text-zinc-400">No songs uploaded yet.</p>
                        ) : (
                            <div className="grid gap-4">
                                {songs.map((song) => (
                                    <div
                                        key={song._id}
                                        className="flex items-center gap-4 rounded-xl bg-zinc-900/60 p-3 transition hover:bg-zinc-800"
                                    >
                                        <Image
                                            src={song.coverImage}
                                            alt={song.title}
                                            width={56}
                                            height={56}
                                            className="h-14 w-14 rounded-lg object-cover"
                                        />

                                        <div className="flex flex-col">
                                            <h2 className="font-semibold">{song.title}</h2>
                                            <Link 
                                                href={`/artists/${encodeURIComponent(song.artist)}`}
                                                className="text-sm text-zinc-400 hover:text-[#6FFBBE] hover:underline"
                                            >
                                                {song.artist}
                                            </Link>
                                        </div>

                                        <button
                                            onClick={() => handlePlay(song)}
                                            className="ml-auto text-green-400 transition hover:scale-110"
                                        >
                                            {currentSong?._id === song._id && isPlaying ? (
                                                <PauseCircle size={32} />
                                            ) : (
                                                <PlayCircle size={32} />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setAddToPlaylistId(song._id)}
                                            className="ml-2 text-zinc-400 transition hover:scale-110 hover:text-white"
                                            title="Add to Playlist"
                                        >
                                            <PlusCircle size={24} />
                                        </button>

                                        <button
                                            onClick={() => setDeleteId(song._id)}
                                            className="ml-2 text-red-400 transition hover:scale-110"
                                            title="Delete Song"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                <Footer />
            </main>

            {/* Create Playlist Modal */}
            {showCreatePlaylistModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Create Playlist</h2>
                            <button onClick={() => setShowCreatePlaylistModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-zinc-400">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={playlistForm.title}
                                    onChange={(e) => setPlaylistForm({ ...playlistForm, title: e.target.value })}
                                    className="rounded-lg bg-zinc-900 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#6FFBBE]"
                                    placeholder="My Awesome Playlist"
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-zinc-400">Description (Optional)</label>
                                <textarea
                                    value={playlistForm.description}
                                    onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
                                    className="h-24 resize-none rounded-lg bg-zinc-900 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[#6FFBBE]"
                                    placeholder="Add an optional description"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full rounded-full bg-[#6FFBBE] py-3 font-semibold text-black transition hover:bg-[#5ceba9]"
                            >
                                Create
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add To Playlist Modal */}
            {addToPlaylistId && (
                <AddToPlaylistModal 
                    songId={addToPlaylistId} 
                    onClose={() => {
                        setAddToPlaylistId(null);
                        fetchPlaylists(); // Refresh playlists to show new song counts
                    }} 
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold text-white">Delete this song?</h2>
                        <p className="mt-2 text-sm text-zinc-400">This action cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-lg bg-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => del(deleteId)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm transition hover:bg-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
