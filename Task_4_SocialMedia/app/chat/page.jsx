'use client'

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSocketContext } from "@/context/SocketContext"
import { Loader2, MessageCircle, MessageSquare, Users, MessageSquarePlus } from "lucide-react"
import ChatWindow from "@/components/ChatWindow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function ChatContent() {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const searchParams = useSearchParams()
    const conversationId = searchParams.get("conversationId")
    const router = useRouter()
    const { on } = useSocketContext()

    const [conversations, setConversations] = useState([])
    const [friends, setFriends] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [loadingConversations, setLoadingConversations] = useState(true)
    const [loadingFriends, setLoadingFriends] = useState(true)
    const [loadingChatId, setLoadingChatId] = useState(null)

    // ── Fetch Conversations ───────────────────────────────
    useEffect(() => {
        if (!userId) return

        setLoadingConversations(true)
        fetch(`/api/conversations?userId=${userId}`)
            .then((r) => r.json())
            .then((data) => {
                const convos = data.conversations || []
                setConversations(convos)

                // Auto-select if coming from friends or rightbar
                if (conversationId) {
                    const match = convos.find((c) => c._id === conversationId)
                    if (match) {
                        setSelectedConversation(match)
                    } else {
                        // If not in existing conversations list, fetch it
                        fetch(`/api/conversations/${conversationId}?userId=${userId}`)
                            .then((r) => r.json())
                            .then((resData) => {
                                if (resData.conversation) {
                                    setConversations((prev) => [resData.conversation, ...prev])
                                    setSelectedConversation(resData.conversation)
                                }
                            })
                            .catch(console.error)
                    }
                }
                setLoadingConversations(false)
            })
            .catch((err) => {
                console.error("Chat: failed to fetch conversations:", err)
                setLoadingConversations(false)
            })
    }, [userId, conversationId])

    // ── Fetch Friends ──────────────────────────────────────
    useEffect(() => {
        if (!userId) return

        setLoadingFriends(true)
        fetch(`/api/friends?userId=${userId}`)
            .then((r) => r.json())
            .then((data) => {
                setFriends(data.friends || [])
                setLoadingFriends(false)
            })
            .catch((err) => {
                console.error("Chat: failed to fetch friends:", err)
                setLoadingFriends(false)
            })
    }, [userId])

    // ── WebSocket Socket Listeners ──────────────────────────
    useEffect(() => {
        if (!userId || !on) return

        // 1. Dynamic User Online updates
        const unsubOnline = on("user_online", (data) => {
            setFriends((prevFriends) =>
                prevFriends.map((f) =>
                    f._id === data.userId ? { ...f, isOnline: data.isOnline } : f
                )
            )
        })

        // 2. New message received (pulls conversation to top or updates preview)
        const unsubNewMsg = on("new_message", (data) => {
            setConversations((prevConvos) => {
                const matchIndex = prevConvos.findIndex((c) => c._id === data.conversationId)
                if (matchIndex === -1) {
                    // Fetch new conversation if not in local state
                    fetch(`/api/conversations?userId=${userId}`)
                        .then((r) => r.json())
                        .then((d) => setConversations(d.conversations || []))
                    return prevConvos
                }

                const updated = [...prevConvos]
                const matched = {
                    ...updated[matchIndex],
                    lastMessage: data.message,
                }
                updated.splice(matchIndex, 1) // Remove from original position
                return [matched, ...updated] // Prepend to top
            })
        })

        return () => {
            unsubOnline()
            unsubNewMsg()
        }
    }, [on, userId])

    // ── Start Chat from Friend ─────────────────────────────
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
                // If it already exists in our local list, use it
                const existing = conversations.find((c) => c._id === data.conversation._id)
                if (existing) {
                    setSelectedConversation(existing)
                } else {
                    setConversations((prev) => [data.conversation, ...prev])
                    setSelectedConversation(data.conversation)
                }
                // Clean URL parameters
                router.replace("/chat", { scroll: false })
            }
        } catch (err) {
            console.error("Chat: failed to start conversation:", err)
        } finally {
            setLoadingChatId(null)
        }
    }

    return (
        <div className="flex h-[calc(100vh-7.5rem)] md:h-screen w-full overflow-hidden">
            {/* ── Desktop Sidebar ────────────────────────────────── */}
            <div className="hidden md:flex w-80 border-r border-border flex-col bg-background shrink-0 select-none">
                <div className="px-5 py-5 border-b border-border flex items-center justify-between">
                    <h2 className="text-foreground font-bold text-lg tracking-tight">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-border/20 scrollbar-thin">
                    {loadingConversations ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                            <Loader2 className="animate-spin h-5 w-5 text-primary" />
                            <span className="text-xs">Loading conversations...</span>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <p className="text-muted-foreground text-sm font-medium">No recent conversations</p>
                            <p className="text-xs text-muted-foreground mt-1">Start chatting with active friends below!</p>
                        </div>
                    ) : (
                        conversations.map((conv) => {
                            const other = conv.participants.find((p) => p._id !== userId)
                            const isSelected = selectedConversation?._id === conv._id
                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => {
                                        setSelectedConversation(conv)
                                        router.replace("/chat", { scroll: false })
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40 transition-colors text-left relative border-l-2
                                        ${isSelected ? "bg-accent/60 border-l-primary" : "border-l-transparent bg-transparent"}`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={other?.image || "/default-avatar.png"} alt={other?.name} />
                                            <AvatarFallback className="font-semibold text-sm">
                                                {other?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {other?.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background z-10" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground font-semibold text-sm truncate">{other?.name}</p>
                                        <p className="text-muted-foreground text-xs truncate mt-0.5">
                                            {conv.lastMessage?.content || "No messages yet"}
                                        </p>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* ── Main View (Responsive Mobile Directory vs. Chat logs) ── */}
            <div className="flex-1 overflow-hidden bg-background">
                {selectedConversation ? (
                    /* Active Chat Session */
                    <ChatWindow
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                    /* Default/Unselected View */
                    <div className="h-full w-full flex flex-col bg-background/40">
                        {/* Mobile Header / Connections Title */}
                        <div className="md:hidden flex items-center px-5 py-5 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-20">
                            <h2 className="text-foreground font-bold text-lg tracking-tight flex items-center gap-2">
                                <MessageCircle size={20} className="text-primary" />
                                Conversations
                            </h2>
                        </div>

                        {/* Mobile Only: Recent Chats and Friends Lists */}
                        <div className="md:hidden flex-1 overflow-y-auto py-4 space-y-6 px-4 pb-24">
                            {/* 1. Recent Conversations */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                                    <MessageSquare size={13} />
                                    Recent Chats
                                </h3>
                                {loadingConversations ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="animate-spin text-primary h-5 w-5" />
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="text-center py-6 border border-dashed border-border/60 rounded-xl bg-card/10 p-4">
                                        <p className="text-xs text-muted-foreground">No recent conversations yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {conversations.map((conv) => {
                                            const other = conv.participants.find((p) => p._id !== userId)
                                            return (
                                                <button
                                                    key={conv._id}
                                                    onClick={() => setSelectedConversation(conv)}
                                                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-accent/40 active:bg-accent/60 rounded-xl transition-all text-left border border-border/40 bg-card/10 shadow-sm"
                                                >
                                                    <div className="relative shrink-0">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={other?.image || "/default-avatar.png"} alt={other?.name} />
                                                            <AvatarFallback className="font-semibold text-sm">
                                                                {other?.name?.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {other?.isOnline && (
                                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background z-10" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-foreground font-semibold text-sm truncate">{other?.name}</p>
                                                        <p className="text-muted-foreground text-xs truncate mt-0.5">
                                                            {conv.lastMessage?.content || "No messages yet"}
                                                        </p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 2. Direct Friends selection Directory */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                                    <Users size={13} />
                                    Start a Conversation
                                </h3>
                                {loadingFriends ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="animate-spin text-primary h-5 w-5" />
                                    </div>
                                ) : friends.length === 0 ? (
                                    <div className="text-center py-8 border border-dashed border-border/60 rounded-xl bg-card/10 p-5 gap-3 flex flex-col items-center">
                                        <p className="text-xs text-muted-foreground">Find friends to chat with them in real-time!</p>
                                        <button
                                            onClick={() => router.push("/friends")}
                                            className="text-xs font-semibold text-primary hover:underline"
                                        >
                                            Find Connections
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {friends.map((friend) => (
                                            <button
                                                key={friend._id}
                                                onClick={() => handleStartChat(friend._id)}
                                                disabled={loadingChatId !== null}
                                                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-accent/40 active:bg-accent/60 rounded-xl transition-all text-left border border-border/40 bg-card/10 shadow-sm"
                                            >
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={friend.image || "/default-avatar.png"} alt={friend.name} />
                                                        <AvatarFallback className="font-semibold text-sm">
                                                            {friend.name?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {friend.isOnline && (
                                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background z-10" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-foreground font-semibold text-sm truncate">{friend.name}</p>
                                                    <p className="text-muted-foreground text-xs truncate">
                                                        @{friend.username || friend.email?.split("@")[0]}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                                    {loadingChatId === friend._id ? (
                                                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                                                    ) : (
                                                        <MessageSquarePlus size={14} />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Only Empty State */}
                        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground/60 shadow-sm">
                                <MessageSquare size={22} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-sm text-foreground">No Chat Selected</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Select a conversation from the sidebar to start messaging</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Chat() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-screen w-full text-muted-foreground gap-2">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
                <span className="text-sm">Loading Chat Room...</span>
            </div>
        }>
            <ChatContent />
        </Suspense>
    )
}