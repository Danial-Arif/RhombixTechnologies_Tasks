'use client';

import Link from 'next/link';
import { Music2 } from 'lucide-react';
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-white/5 bg-black/40 px-10 py-12 backdrop-blur-md">
            <div className="flex flex-col gap-12">
                <div className="flex justify-between gap-8 md:gap-10">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4 max-w-xs">
                        <div className="flex items-center gap-2 text-[#6FFBBE]">
                            <Music2 size={32} />
                            <span className="text-2xl font-black tracking-tighter">My Music</span>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Experience the future of music streaming. High-fidelity audio,
                            curated playlists, and an immersive interface designed for true audiophiles.
                        </p>
                    </div>

                    <div className="flex flex-row gap-6">
                        <a href="https://www.linkedin.com/in/danial-arif-84b7bb180/" target="_blank" className="hover:text-zinc-400 cursor-pointer transition"><FaLinkedin size={24} /></a>
                        <a href="https://github.com/Danial-Arif" target="_blank" className="hover:text-zinc-400 cursor-pointer transition"><FaGithub size={24} /></a>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-4">
                    <p className="text-xs text-zinc-600">
                        &copy; {new Date().getFullYear()} My Music Group. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-[10px] font-bold uppercase tracking-tighter text-zinc-600">
                        <span className="hover:text-zinc-400 cursor-pointer transition">English (US)</span>
                        <span className="hover:text-zinc-400 cursor-pointer transition">USD (PKR)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
