'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useSocketContext } from "@/context/SocketContext"
import { Search, MessageSquare, Users, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Rightbar() {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const pathname = usePathname()
    const router = useRouter()
    const { on } = useSocketContext()

    const [friends, setFriends] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [loadingChatId, setLoadingChatId] = useState(null)

    // Hide Rightbar on specific pages
    const isExcludedPage = ["/login", "/register", "/chat"].includes(pathname)

    useEffect(() => {
        if (!userId || isExcludedPage) return

        setLoading(true)
        fetch(`/api/friends?userId=${userId}`)
            .then((r) => r.json())
            .then((data) => {
                setFriends(data.friends || [])
                setLoading(false)
            })
            .catch((err) => {
                console.error("Rightbar: failed to fetch friends:", err)
                setLoading(false)
            })
    }, [userId, pathname])

    // Live Socket listener for user online/offline status updates
    useEffect(() => {
        if (isExcludedPage || !on) return

        const unsubOnline = on("user_online", (data) => {
            setFriends((prevFriends) =>
                prevFriends.map((f) =>
                    f._id === data.userId ? { ...f, isOnline: data.isOnline } : f
                )
            )
        })

        const unsubFriendAccepted = on("friend_accepted", (data) => {
            // If a friend request is accepted, add them to our lists
            setFriends((prev) => {
                if (prev.find((f) => f._id === data.userId)) return prev
                return [...prev, { ...data.acceptor, isOnline: true }]
            })
        })

        return () => {
            unsubOnline()
            unsubFriendAccepted()
        }
    }, [on, isExcludedPage])

    if (!userId || isExcludedPage) return null

    // Filter contacts based on search query
    const filteredFriends = friends.filter((f) =>
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleStartChat = async (friendId) => {
        if (loadingChatId) return
        setLoadingChatId(friendId)
        try {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, targetUserId: friendId }),
            })
            const data = await res.json()
            if (res.ok) {
                router.push(`/chat?conversationId=${data.conversation._id}`)
            }
        } catch (err) {
            console.error("Rightbar: failed to start conversation:", err)
        } finally {
            setLoadingChatId(null)
        }
    }

    return (
        <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 border-l border-border bg-background/30 backdrop-blur-xl shrink-0 z-30 select-none">
            {/* Header */}
            <div className="px-6 py-6 border-b border-border/40">
                <h3 className="text-foreground font-bold text-base tracking-tight flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Active Contacts
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Chat directly with your connections</p>
            </div>

            {/* Search filter */}
            {friends.length > 0 && (
                <div className="px-5 py-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter friends..."
                            className="pl-8 h-9 text-xs rounded-lg bg-muted/40 border-border/50 focus-visible:ring-1"
                        />
                    </div>
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-8 space-y-1 scrollbar-thin">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin h-5 w-5 text-primary" />
                        <span className="text-xs">Loading contacts...</span>
                    </div>
                ) : friends.length === 0 ? (
                    <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none mx-2 mt-4">
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="font-semibold text-xs text-foreground">No connections yet</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Connect with people to chat in real-time</p>
                            </div>
                            <button
                                onClick={() => router.push("/friends")}
                                className="text-[10px] font-semibold text-primary hover:underline"
                            >
                                Find Connections
                            </button>
                        </CardContent>
                    </Card>
                ) : filteredFriends.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No contacts match your query</p>
                ) : (
                    filteredFriends.map((friend) => (
                        <button
                            key={friend._id}
                            onClick={() => handleStartChat(friend._id)}
                            disabled={loadingChatId !== null}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent/40 rounded-xl transition-all duration-200 group text-left relative"
                        >
                            <div className="relative shrink-0">
                                <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-border/40 transition-all duration-200">
                                    <AvatarImage src={friend.image || "/default-avatar.png"} alt={friend.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                        {friend.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {friend.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background z-10 animate-in fade-in zoom-in" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                                    {friend.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    @{friend.username || friend.email?.split("@")[0]}
                                </p>
                            </div>

                            <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 rounded-full bg-primary/10 text-primary">
                                {loadingChatId === friend._id ? (
                                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                                ) : (
                                    <MessageSquare size={13} />
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </aside>
    )
}
