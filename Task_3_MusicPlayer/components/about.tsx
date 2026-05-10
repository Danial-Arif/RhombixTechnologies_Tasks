'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Music2, Settings, Heart } from 'lucide-react';

type AboutProps = {
    playlists?: number;
    likedSongs?: number;
};

export default function About({
    likedSongs = 0,
}: AboutProps) {
    const { data: session } = useSession();

    return (
        <section className="relative flex min-h-[45vh] items-end overflow-hidden bg-gradient-to-b from-[#0f5132] via-[#0b3d27] to-black px-6 pb-8 pt-24 md:px-10">
            {/* Glow Effects */}
            <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-green-400/20 blur-3xl" />
            <div className="absolute bottom-[-120px] right-[-120px] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between">
                {/* User Info */}
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
                    <div className="relative">
                        <Image
                            src={session?.user?.image || '/default-avatar.png'}
                            alt={session?.user?.name || 'User avatar'}
                            width={100}
                            height={100}
                            className="rounded-full border-4 border-white/10 object-cover shadow-2xl"
                        />

                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="break-words text-4xl font-extrabold leading-tight md:text-4xl">
                            {session?.user?.name || 'Guest'}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-300 md:justify-start">
                            <span className="flex items-center gap-2">
                                <Music2 size={16} />
                                128 playlists
                            </span>

                            <span className="flex items-center gap-2">
                                <Heart size={16} />
                                2.4k liked songs
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Button */}
                <button className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur-md transition hover:bg-white/20">
                    <Settings size={18} />
                    Edit Profile
                </button>
            </div>
        </section>
    );
}