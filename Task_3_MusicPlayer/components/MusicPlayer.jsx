'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';

import { usePlayer } from '@/context/PlayerContext';

export default function MusicPlayer() {
    const pathname = usePathname();
    const {
        currentSong,
        isPlaying,
        volume,
        currentTime,
        duration,
        pauseSong,
        resumeSong,
        stopSong,
        playNext,
        playPrevious,
        seekTo,
        changeVolume,
    } = usePlayer();

    if (!currentSong || pathname.startsWith('/Music/')) return null;

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = () => {
        if (isPlaying) {
            pauseSong();
        } else {
            resumeSong();
        }
    };

    const toggleMute = () => {
        if (volume > 0) {
            changeVolume(0);
        } else {
            changeVolume(1);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-24 px-20 items-center justify-between border-t border-white/5 bg-zinc-950/80 px-6 backdrop-blur-2xl">
            {/* Left: Song Info */}
            <div className="flex w-1/3 items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-md shadow-lg shadow-black/40">
                    <Image
                        src={currentSong.coverImage}
                        alt={currentSong.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white">
                        {currentSong.title}
                    </h3>
                    <p className="line-clamp-1 text-xs text-zinc-400">
                        {currentSong.artist}
                    </p>
                </div>
            </div>

            {/* Center: Controls & Progress */}
            <div className="flex w-1/3 max-w-[500px] flex-col items-center gap-2">
                {/* Buttons */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={playPrevious}
                        className="text-zinc-400 transition hover:text-white"
                    >
                        <SkipBack size={20} fill="currentColor" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4dffbb] text-black shadow-lg transition hover:scale-105"
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="currentColor" className="text-black" />
                        ) : (
                            <Play size={20} fill="currentColor" className="text-black ml-1" />
                        )}
                    </button>

                    <button
                        onClick={() => playNext()}
                        className="text-zinc-400 transition hover:text-white"
                    >
                        <SkipForward size={20} fill="currentColor" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex w-full items-center gap-3 text-xs text-zinc-400">
                    <span className="w-10 text-right">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime || 0}
                        onChange={(e) => seekTo(Number(e.target.value))}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[#6FFBBE]"
                    />
                    <span className="w-10">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Volume */}
            <div className="flex w-1/3 items-center justify-end gap-3">
                <button
                    onClick={toggleMute}
                    className="text-zinc-400 transition hover:text-white"
                >
                    {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-white transition-all hover:accent-[#6FFBBE]"
                />
            </div>
            <div className="absolute right-5 top-5 z-50 flex justify-end items-center">
                <button className='text-zinc-400 transition hover:text-white' onClick={stopSong}><X size={20} className="text-white transition hover:scale-110 hover:text-red-400" /></button>
            </div>
        </div>
    );
}