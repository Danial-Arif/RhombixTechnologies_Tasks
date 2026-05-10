'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Search,
    Library,
    PlusSquare,
    Heart,
    Music,
} from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navItems = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
        },
        {
            href: '/search',
            label: 'Search',
            icon: Search,
        },
        {
            href: '/songs',
            label: 'Songs',
            icon: Music,
        },
        {
            href: '/artists',
            label: 'Artists',
            icon: Library,
        },
        {
            href: '/upload',
            label: 'Upload',
            icon: PlusSquare,
        },
        {
            href: '/liked',
            label: 'Liked',
            icon: Heart,
        },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`fixed left-0 top-0 z-50 hidden h-screen w-[260px] flex-col justify-between border-r px-5 py-6 md:flex ${pathname.startsWith('/Music/')
                ? 'border-transparent bg-transparent drop-shadow-2xl'
                : 'border-white/5 bg-[#121212]'
                }`}>
                <div>
                    {/* Logo */}
                    <div className="mb-10">
                        <h1 className="text-2xl font-extrabold tracking-tight text-[#6FFBBE]">
                            My Music
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Feel every beat.
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${isActive
                                            ? 'bg-[#1DB954]/15 text-white'
                                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon
                                        size={20}
                                        className={`transition ${isActive
                                            ? 'text-[#6FFBBE]'
                                            : 'text-zinc-500 group-hover:text-white'
                                            }`}
                                    />

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User */}
                <div className="border-t border-white/5 pt-5">
                    {session?.user ? (
                        <Link
                            href="/profile"
                            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
                        >
                            <Image
                                src={session.user.image || '/default-avatar.png'}
                                alt="Profile"
                                width={45}
                                height={45}
                                className="rounded-full object-cover"
                            />

                            <div className="overflow-hidden">
                                <p className="truncate text-sm font-semibold text-white">
                                    {session.user.name}
                                </p>

                                <p className="text-xs text-zinc-500">
                                    View Profile
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </aside>

            {/* Mobile Bottom Navbar */}
            <nav className={`fixed bottom-0 left-0 z-50 flex w-full items-center justify-around px-2 py-3 md:hidden ${pathname.startsWith('/Music/')
                ? 'bg-transparent border-transparent'
                : 'border-t border-white/10 bg-[#121212]/95 backdrop-blur-lg'
                }`}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 text-[11px] transition
              ${isActive
                                    ? 'text-[#6FFBBE]'
                                    : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}