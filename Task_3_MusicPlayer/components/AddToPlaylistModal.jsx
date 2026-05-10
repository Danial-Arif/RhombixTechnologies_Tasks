'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function AddToPlaylistModal({ songId, onClose }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingTo, setAddingTo] = useState(null);

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
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    const handleAddToPlaylist = async (playlistId) => {
        setAddingTo(playlistId);
        try {
            const res = await fetch(`/api/playlist/${playlistId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songId, action: 'add' })
            });
            if (res.ok) {
                // Just close the modal on success
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAddingTo(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Save to Playlist</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <p className="text-zinc-400">Loading your playlists...</p>
                ) : playlists.length === 0 ? (
                    <p className="text-zinc-400">You don&apos;t have any playlists yet. Go to the Playlists page to create one!</p>
                ) : (
                    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-2">
                        {playlists.map((playlist) => {
                            // Check if song is already in the playlist (handle both populated object or just ID)
                            const isAdded = playlist.songs.some(s => s._id === songId || s === songId);
                            
                            return (
                                <button
                                    key={playlist._id}
                                    onClick={() => !isAdded && handleAddToPlaylist(playlist._id)}
                                    disabled={isAdded || addingTo === playlist._id}
                                    className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-left transition hover:bg-zinc-800 disabled:opacity-50"
                                >
                                    <span className="font-medium text-white">{playlist.title}</span>
                                    {isAdded ? (
                                        <Check size={20} className="text-[#6FFBBE]" />
                                    ) : addingTo === playlist._id ? (
                                        <span className="text-sm text-zinc-400">Saving...</span>
                                    ) : (
                                        <span className="text-sm text-zinc-400">Add</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
