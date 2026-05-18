'use client'

import { Home, MessageCircle, Bell, Users, LogIn, Settings, LogOut, SquarePen, ChevronUp } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSocketContext } from "@/context/SocketContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const { on } = useSocketContext()
    const [unreadNotifs, setUnreadNotifs] = useState(0)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const [profileOpen, setProfileOpen] = useState(false)

    const userId = session?.user?.id

    useEffect(() => {
        if (!userId) return
        fetch(`/api/notifications?userId=${userId}&unreadOnly=true`)
            .then(r => r.json())
            .then(data => setUnreadNotifs(data.unreadCount || 0))
            .catch(() => { })
    }, [userId, pathname])

    useEffect(() => {
        if (!on) return
        const unsub = on("new_notification", () => setUnreadNotifs(p => p + 1))
        const unsubMsg = on("new_message", () => {
            if (!pathname.startsWith("/chat")) setUnreadMessages(p => p + 1)
        })
        return () => { unsub(); unsubMsg() }
    }, [on, pathname])

    useEffect(() => {
        if (pathname.startsWith("/chat")) setTimeout(() => setUnreadMessages(0), 0)
        if (pathname === "/notifications") setTimeout(() => setUnreadNotifs(0), 0)
        setProfileOpen(false)
    }, [pathname])

    if (pathname === "/login" || pathname === "/register") return null

    const isActive = (href) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href)

    const navLinks = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/friends", icon: Users, label: "Friends" },
        { href: "/chat", icon: MessageCircle, label: "Messages", badge: unreadMessages },
        { href: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifs },
    ]

    const UserBlock = () => (
        <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage src={session?.user?.image || "/default-avatar.png"} />
                <AvatarFallback className="rounded-lg text-xs font-semibold bg-muted">
                    {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate leading-none mb-0.5">
                    {session?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-none">
                    {session?.user?.email}
                </p>
            </div>
        </div>
    )

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-sidebar border-r border-sidebar-border">

                {/* Logo */}
                <div className="flex h-16 items-center px-6 border-b border-sidebar-border shrink-0">
                    <Link href="/" className="flex items-center gap-2.5 font-semibold">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                            <span className="text-primary-foreground text-xs font-bold">N</span>
                        </div>
                        <span className="text-base">Nexus</span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navLinks.map(({ href, icon: Icon, label, badge }) => {
                        const active = isActive(href)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`
                                    group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                                    ${active
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    }
                                `}
                            >
                                <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                                <span className="flex-1">{label}</span>
                                {badge > 0 && (
                                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                                        {badge > 99 ? "99+" : badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}

                    <div className="pt-2">
                        <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                            Create
                        </p>
                        <Link
                            href="/create"
                            className={`
                                group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                                ${isActive("/create")
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                }
                            `}
                        >
                            <SquarePen className="h-4 w-4 shrink-0" strokeWidth={isActive("/create") ? 2.5 : 2} />
                            <span>New post</span>
                        </Link>
                    </div>
                </nav>

                {/* Footer — user or sign in */}
                <div className="shrink-0 border-t border-sidebar-border p-3">
                    {status === "loading" ? (
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                                <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
                            </div>
                        </div>
                    ) : session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-sidebar-accent transition-colors outline-none group">
                                    <UserBlock />
                                    <ChevronUp className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </button>
                            } />
                            <DropdownMenuContent
                                side="top"
                                align="end"
                                sideOffset={8}
                                className="w-56 rounded-xl"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                                <AvatarImage src={session.user.image || "/default-avatar.png"} />
                                                <AvatarFallback className="rounded-lg text-xs font-semibold">
                                                    {session.user.name?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate">{session.user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/profile/${session.user.id}`} className="cursor-pointer flex items-center w-full">
                                        <Users className="mr-2 h-4 w-4 shrink-0" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer flex items-center w-full">
                                        <Settings className="mr-2 h-4 w-4 shrink-0" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            href="/login"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                            <LogIn className="h-4 w-4 shrink-0" strokeWidth={2} />
                            Sign in
                        </Link>
                    )}
                </div>
            </aside>

            {/* ── Mobile Top Bar ── */}
            <header className="md:hidden fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                        <span className="text-primary-foreground text-xs font-bold">N</span>
                    </div>
                    <span>Nexus</span>
                </Link>

                {status === "loading" ? (
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                ) : session?.user ? (
                    <button onClick={() => setProfileOpen(true)} className="relative outline-none">
                        <Avatar className="h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-border transition-all">
                            <AvatarImage src={session.user.image || "/default-avatar.png"} />
                            <AvatarFallback className="text-xs font-semibold">
                                {session.user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {(unreadNotifs > 0 || unreadMessages > 0) && (
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                        )}
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LogIn className="h-4 w-4" />
                        Sign in
                    </Link>
                )}
            </header>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 flex h-16 items-center border-t bg-background/95 backdrop-blur">
                {navLinks.map(({ href, icon: Icon, label, badge }) => {
                    const active = isActive(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2"
                        >
                            <div className="relative">
                                <Icon
                                    className={`h-5 w-5 transition-colors ${active ? "text-foreground" : "text-muted-foreground"}`}
                                    strokeWidth={active ? 2.5 : 1.8}
                                />
                                {badge > 0 && (
                                    <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground leading-none">
                                        {badge > 9 ? "9+" : badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground"}`}>
                                {label}
                            </span>
                            {active && (
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                            )}
                        </Link>
                    )
                })}

                <Link
                    href="/create"
                    className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2"
                >
                    <SquarePen
                        className={`h-5 w-5 transition-colors ${isActive("/create") ? "text-foreground" : "text-muted-foreground"}`}
                        strokeWidth={isActive("/create") ? 2.5 : 1.8}
                    />
                    <span className={`text-[10px] font-medium transition-colors ${isActive("/create") ? "text-foreground" : "text-muted-foreground"}`}>
                        Post
                    </span>
                    {isActive("/create") && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                    )}
                </Link>
            </nav>

            {/* ── Mobile Profile Sheet (shadcn Sheet) ── */}
            <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                <SheetContent side="bottom" className="md:hidden rounded-t-2xl px-0 pb-safe">
                    <SheetHeader className="px-4 pb-3 border-b">
                        <SheetTitle className="sr-only">Profile menu</SheetTitle>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-xl shrink-0">
                                <AvatarImage src={session?.user?.image || "/default-avatar.png"} />
                                <AvatarFallback className="rounded-xl font-semibold">
                                    {session?.user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                            </div>
                        </div>
                    </SheetHeader>

                    <div className="flex flex-col py-2">
                        <Link
                            href={`/profile/${session?.user?.id}`}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                        >
                            <Avatar className="h-4 w-4 rounded-sm shrink-0">
                                <AvatarImage src={session?.user?.image || "/default-avatar.png"} />
                                <AvatarFallback className="text-[8px]">
                                    {session?.user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            View profile
                        </Link>
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
                        >
                            <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                            Settings
                        </Link>

                        <div className="my-1 border-t" />

                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign out
                        </button>
                    </div>

                    <div className="h-6" />
                </SheetContent>
            </Sheet>
        </>
    )
}