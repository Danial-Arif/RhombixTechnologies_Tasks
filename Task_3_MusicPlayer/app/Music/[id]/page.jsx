'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Heart,
    PlusCircle,
    ChevronDown,
    Music
} from 'lucide-react';

import Navbar from "@/components/navbar";
import { usePlayer } from '@/context/PlayerContext';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import { useSession } from 'next-auth/react';

export default function MusicPlayerPage({ params, searchParams }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white">
                <div className="flex h-screen items-center justify-center text-zinc-500">
                    <Music size={48} className="animate-pulse" />
                </div>
            </div>
        }>
            <MusicPlayerContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}

function MusicPlayerContent({ params, searchParams }) {
    const resolvedParams = use(params);
    const resolvedSearchParams = use(searchParams);
    
    const router = useRouter();
    const id = resolvedParams.id;
    const { data: session } = useSession();
    const shouldPlay = resolvedSearchParams.play === 'true';

    const [song, setSong] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    const {
        currentSong,
        isPlaying,
        volume,
        currentTime,
        duration,
        playSong,
        pauseSong,
        resumeSong,
        playNext,
        playPrevious,
        seekTo,
        changeVolume,
        setQueue,
    } = usePlayer();

    const isCurrentSong = currentSong?._id === song?._id;
    const rotating = isCurrentSong && isPlaying;

    useEffect(() => {
        const fetchSongData = async () => {
            try {
                const res = await fetch(`/api/songs/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setSong(data);
                }

                const likedRes = await fetch('/api/Liked');
                if (likedRes.ok) {
                    const likedSongs = await likedRes.json();
                    const liked = likedSongs.some(l => l.songId?._id === id || l.songId === id);
                    setIsLiked(liked);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSongData();
    }, [id]);

    useEffect(() => {
        if (song && shouldPlay) {
            playSong(song);
            
            // Clear query param
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [song, shouldPlay]);

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = () => {
        if (!song) return;
        if (isCurrentSong) {
            if (isPlaying) pauseSong();
            else resumeSong();
        } else {
            playSong(song, [song]);
        }
    };

    const toggleMute = () => {
        if (volume > 0) changeVolume(0);
        else changeVolume(1);
    };

    const toggleLike = async () => {
        if (!session) {
            alert('Please sign in to like songs');
            return;
        }

        try {
            const res = await fetch('/api/Liked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songId: id })
            });

            if (res.ok) {
                const data = await res.json();
                setIsLiked(data.liked);
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-500">
                        <Music size={48} className="animate-pulse" />
                        <p>Loading your music...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!song) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                    <p className="text-zinc-400">Song not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white overflow-hidden">
            <Navbar />

            {/* Dynamic Blurred Background */}
            <div className="absolute inset-0 z-0 h-full w-full opacity-30">
                <Image
                    src={song.coverImage}
                    alt="Background blur"
                    fill
                    className="object-cover blur-[100px] scale-110 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
            </div>

            <div className="relative z-10 flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center px-4 md:ml-[260px] md:h-screen md:w-[calc(100%-260px)]">

                {/* Minimize Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 p-2 text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white md:left-8 md:top-8"
                    title="Minimize Player"
                >
                    <ChevronDown size={24} />
                </button>

                <div className="flex w-full max-w-[400px] flex-col items-center justify-center gap-5">

                    {/* Vinyl Record Animation */}
                    <div className="relative flex aspect-square w-[55vw] max-w-[260px] shrink-0 items-center justify-center drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] md:w-[35vh] md:max-w-[320px]">
                        <div className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[4px] border-zinc-900 bg-black transition-transform duration-[4000ms] ease-linear ${rotating ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                            {/* Realistic record grooves (subtle gradients) */}
                            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_40%,rgba(255,255,255,0.05)_45%,transparent_50%,rgba(255,255,255,0.02)_60%,transparent_70%)]" />

                            <Image
                                src={song.coverImage}
                                alt={song.title}
                                fill
                                className="object-cover opacity-90"
                            />

                            {/* Inner Vinyl Label/Hole */}
                            <div className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-md">
                                <div className="h-2 w-2 rounded-full bg-black shadow-inner" />
                            </div>
                        </div>
                    </div>

                    {/* Controls Container */}
                    <div className="flex w-full shrink-0 flex-col gap-4 rounded-3xl border border-white/5 bg-black/40 p-5 shadow-2xl backdrop-blur-2xl">

                        {/* Song Info & Actions */}
                        <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col overflow-hidden pr-2">
                                <h1 className="truncate text-lg font-black tracking-tight text-white md:text-xl">{song.title}</h1>
                                <p className="truncate text-xs font-medium text-white/60 md:text-sm">{song.artist}</p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                                <button
                                    onClick={toggleLike}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition hover:scale-105 hover:bg-white/10"
                                >
                                    <Heart
                                        size={18}
                                        className={isLiked ? 'fill-white text-white' : 'text-white/70'}
                                    />
                                </button>
                                <button
                                    onClick={() => setShowPlaylistModal(true)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition hover:scale-105 hover:bg-white/10"
                                >
                                    <PlusCircle size={18} className="text-white/70" />
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex w-full flex-col gap-1.5">
                            <input
                                type="range"
                                min={0}
                                max={(isCurrentSong && duration) ? duration : 100}
                                value={isCurrentSong ? currentTime : 0}
                                onChange={(e) => {
                                    if (isCurrentSong) seekTo(Number(e.target.value));
                                }}
                                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#6FFBBE] transition-all hover:h-1.5"
                                disabled={!isCurrentSong}
                            />
                            <div className="flex w-full justify-between text-[10px] font-semibold tracking-wider text-white/50">
                                <span>{formatTime(isCurrentSong ? currentTime : 0)}</span>
                                <span>{formatTime(isCurrentSong ? duration : 0)}</span>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="grid grid-cols-3 items-center pt-1">

                            {/* Volume Control (Left) */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={toggleMute}
                                    className="text-white/50 transition hover:text-white"
                                >
                                    {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={(e) => changeVolume(Number(e.target.value))}
                                    className="hidden h-1 w-12 cursor-pointer appearance-none rounded-full bg-white/10 accent-white transition-all hover:accent-[#6FFBBE] sm:block"
                                />
                            </div>

                            {/* Playback Controls (Center) */}
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={playPrevious}
                                    className="text-white/70 transition hover:scale-110 hover:text-white"
                                >
                                    <SkipBack size={20} fill="currentColor" />
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] transition hover:scale-105 hover:bg-[#6FFBBE] hover:shadow-[0_0_15px_rgba(111,251,190,0.4)]"
                                >
                                    {rotating ? (
                                        <Pause size={20} fill="currentColor" className="text-black" />
                                    ) : (
                                        <Play size={20} fill="currentColor" className="ml-1 text-black" />
                                    )}
                                </button>

                                <button
                                    onClick={() => playNext()}
                                    className="text-white/70 transition hover:scale-110 hover:text-white"
                                >
                                    <SkipForward size={20} fill="currentColor" />
                                </button>
                            </div>

                            {/* Empty right spacer */}
                            <div />
                        </div>
                    </div>

                </div>
            </div>

            {showPlaylistModal && (
                <AddToPlaylistModal
                    songId={id}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </div>
    );
}