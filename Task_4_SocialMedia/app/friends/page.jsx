'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSocketContext } from "@/context/SocketContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, UserPlus, Check, X, MessageCircle, UserMinus, Loader2, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function FriendsPage() {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const { on } = useSocketContext()
    const router = useRouter()

    const [friends, setFriends] = useState([])
    const [received, setReceived] = useState([])
    const [sent, setSent] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [loadingIds, setLoadingIds] = useState(new Set())
    const [activeTab, setActiveTab] = useState("friends")

    useEffect(() => {
        if (!userId) return
        fetch(`/api/friends?userId=${userId}`)
            .then((r) => r.json())
            .then((data) => {
                setFriends(data.friends || [])
                setReceived(data.received || [])
                setSent(data.sent || [])
            })
    }, [userId])

    useEffect(() => {
        const unsubRequest = on("friend_request", (data) => {
            setReceived((prev) => [data.sender, ...prev])
        })
        const unsubAccepted = on("friend_accepted", (data) => {
            const newFriend = sent.find((u) => u._id === data.userId)
            if (newFriend) {
                setFriends((prev) => [newFriend, ...prev])
                setSent((prev) => prev.filter((u) => u._id !== data.userId))
            }
        })
        return () => { unsubRequest(); unsubAccepted() }
    }, [on, sent])

    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([])
            return
        }
        const timeout = setTimeout(async () => {
            setSearching(true)
            const res = await fetch(`/api/users/search?q=${searchQuery}&userId=${userId}`)
            const data = await res.json()
            setSearchResults(data.users || [])
            setSearching(false)
        }, 400)
        return () => clearTimeout(timeout)
    }, [searchQuery, userId])

    const setLoading = (id, val) => {
        setLoadingIds((prev) => {
            const next = new Set(prev)
            val ? next.add(id) : next.delete(id)
            return next
        })
    }

    const handleSendRequest = async (targetId) => {
        setLoading(targetId, true)
        const res = await fetch("/api/friends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetId }),
        })
        if (res.ok) {
            setSent((prev) => [...prev, searchResults.find((u) => u._id === targetId)])
        }
        setLoading(targetId, false)
    }

    const handleAccept = async (targetId) => {
        setLoading(targetId, true)
        const res = await fetch("/api/friends", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetId, action: "accept" }),
        })
        if (res.ok) {
            const newFriend = received.find((u) => u._id === targetId)
            setFriends((prev) => [newFriend, ...prev])
            setReceived((prev) => prev.filter((u) => u._id !== targetId))
        }
        setLoading(targetId, false)
    }

    const handleDecline = async (targetId) => {
        setLoading(targetId, true)
        await fetch("/api/friends", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetId, action: "decline" }),
        })
        setReceived((prev) => prev.filter((u) => u._id !== targetId))
        setLoading(targetId, false)
    }

    const handleUnfriend = async (targetId) => {
        setLoading(targetId, true)
        await fetch("/api/friends", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetId }),
        })
        setFriends((prev) => prev.filter((u) => u._id !== targetId))
        setLoading(targetId, false)
    }

    const handleMessage = async (targetId) => {
        const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, targetUserId: targetId }),
        })
        const data = await res.json()
        if (res.ok) {
            router.push(`/chat?conversationId=${data.conversation._id}`)
        }
    }

    const getFriendStatus = (targetId) => {
        if (friends.find((u) => u._id === targetId)) return "friends"
        if (sent.find((u) => u._id === targetId)) return "sent"
        if (received.find((u) => u._id === targetId)) return "received"
        return "none"
    }

    return (
        <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-28 md:pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users size={18} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
                    <p className="text-sm text-muted-foreground">Manage your friends and requests</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-11 mb-6">
                    <TabsTrigger value="friends" className="text-sm font-medium gap-2">
                        Friends
                        {friends.length > 0 && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-primary/15 text-primary">
                                {friends.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="text-sm font-medium gap-2">
                        Requests
                        {received.length > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                {received.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="search" className="text-sm font-medium">
                        Find People
                    </TabsTrigger>
                </TabsList>

                {/* ── Friends Tab ── */}
                <TabsContent value="friends" className="space-y-3 animate-in fade-in duration-200">
                    {friends.length === 0 ? (
                        <EmptyState
                            title="No friends yet"
                            description="Search for people to add as friends"
                            action={<Button variant="outline" size="sm" onClick={() => setActiveTab("search")}>Find Friends</Button>}
                        />
                    ) : (
                        friends.map((friend) => (
                            <UserCard key={friend._id} user={friend}>
                                <Button size="sm" variant="outline" onClick={() => handleMessage(friend._id)} className="gap-1.5">
                                    <MessageCircle size={14} />
                                    <span className="hidden sm:inline">Message</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUnfriend(friend._id)}
                                    disabled={loadingIds.has(friend._id)}
                                    className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    {loadingIds.has(friend._id) ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                                </Button>
                            </UserCard>
                        ))
                    )}
                </TabsContent>

                {/* ── Requests Tab ── */}
                <TabsContent value="requests" className="space-y-5 animate-in fade-in duration-200">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incoming Requests</p>
                        {received.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-3 px-4 bg-muted/30 rounded-lg border border-border/50">No pending requests</p>
                        ) : (
                            received.map((user) => (
                                <UserCard key={user._id} user={user}>
                                    <Button size="sm" onClick={() => handleAccept(user._id)} disabled={loadingIds.has(user._id)} className="gap-1.5">
                                        {loadingIds.has(user._id) ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        <span className="hidden sm:inline">Accept</span>
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleDecline(user._id)} disabled={loadingIds.has(user._id)} className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive">
                                        <X size={14} />
                                        <span className="hidden sm:inline">Decline</span>
                                    </Button>
                                </UserCard>
                            ))
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sent Requests</p>
                        {sent.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-3 px-4 bg-muted/30 rounded-lg border border-border/50">No sent requests</p>
                        ) : (
                            sent.map((user) => (
                                <UserCard key={user._id} user={user}>
                                    <Badge variant="outline" className="text-xs text-muted-foreground">Pending...</Badge>
                                </UserCard>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* ── Search Tab ── */}
                <TabsContent value="search" className="space-y-4 animate-in fade-in duration-200">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or username..."
                            className="pl-9 h-11"
                        />
                        {searching && (
                            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
                        )}
                    </div>

                    <div className="space-y-3">
                        {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                            <p className="text-sm text-muted-foreground text-center py-8">No users found for "{searchQuery}"</p>
                        )}
                        {searchResults.map((user) => {
                            const status = getFriendStatus(user._id)
                            return (
                                <UserCard key={user._id} user={user}>
                                    {status === "friends" && (
                                        <Badge variant="secondary" className="px-3 bg-primary/10 text-primary gap-1.5">
                                            <Check size={12} /> Friends
                                        </Badge>
                                    )}
                                    {status === "sent" && (
                                        <Badge variant="outline" className="px-3 text-muted-foreground">Pending...</Badge>
                                    )}
                                    {status === "received" && (
                                        <Button size="sm" onClick={() => handleAccept(user._id)}>Accept Request</Button>
                                    )}
                                    {status === "none" && (
                                        <Button size="sm" onClick={() => handleSendRequest(user._id)} disabled={loadingIds.has(user._id)} className="gap-1.5">
                                            {loadingIds.has(user._id) ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                                            <span className="hidden sm:inline">Add Friend</span>
                                            <span className="sm:hidden">Add</span>
                                        </Button>
                                    )}
                                </UserCard>
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function UserCard({ user, children }) {
    return (
        <Card className="border-border/60 hover:border-border transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
                <Link href={`/profile/${user._id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                    <Avatar className="h-11 w-11 ring-2 ring-border shrink-0 transition-transform group-hover:scale-105">
                        <AvatarImage src={user.image || "/default-avatar.png"} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate group-hover:underline">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                    {children}
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ title, description, action }) {
    return (
        <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-14 text-center gap-3">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
                {action}
            </CardContent>
        </Card>
    )
}