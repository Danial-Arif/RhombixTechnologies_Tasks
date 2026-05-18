'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSocketContext } from "@/context/SocketContext"
import {
    Bell, Heart, MessageCircle, UserPlus, UserCheck,
    AtSign, CheckCheck, Loader2, Trash2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

const NOTIF_ICONS = {
    like: { icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
    comment: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
    follow: { icon: UserPlus, color: "text-violet-400", bg: "bg-violet-400/10" },
    friend_request: { icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    message: { icon: MessageCircle, color: "text-sky-400", bg: "bg-sky-400/10" },
    mention: { icon: AtSign, color: "text-amber-400", bg: "bg-amber-400/10" },
}

const NOTIF_TEXT = {
    like: "liked your post",
    comment: "commented on your post",
    follow: "started following you",
    friend_request: "sent you a friend request",
    message: "sent you a message",
    mention: "mentioned you",
}

function formatTime(date) {
    const now = new Date()
    const d = new Date(date)
    const diff = (now - d) / 1000

    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return d.toLocaleDateString()
}

function NotifSkeleton() {
    return (
        <Card className="border-border/60">
            <CardContent className="p-4 flex items-start gap-4">
                <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-3.5 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function NotificationsPage() {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const { on } = useSocketContext()

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")

    useEffect(() => {
        if (!userId) return
        setLoading(true)
        const params = new URLSearchParams({ userId })
        if (filter === "unread") params.set("unreadOnly", "true")
        fetch(`/api/notifications?${params}`)
            .then(r => r.json())
            .then(data => setNotifications(data.notifications || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [userId, filter])

    useEffect(() => {
        const unsub = on("new_notification", ({ notification }) => {
            setNotifications(prev => {
                if (prev.find(n => n._id === notification._id)) return prev
                return [notification, ...prev]
            })
        })
        return unsub
    }, [on])

    const markAllRead = async () => {
        if (!userId) return
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, markAll: true }),
        })
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }

    const markAsRead = async (notifId) => {
        if (!userId) return
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, notificationIds: [notifId] }),
        })
        setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n))
    }

    const deleteNotification = async (notifId) => {
        await fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, notificationId: notifId }),
        })
        setNotifications(prev => prev.filter(n => n._id !== notifId))
    }

    const unreadCount = notifications.filter(n => !n.isRead).length

    return (
        <div className="max-w-2xl mx-auto px-4 pt-8 md:pt-12 pb-28 md:pb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell size={18} className="text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                            {unreadCount > 0 && (
                                <Badge className="h-5 px-1.5 text-xs rounded-full">
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">Stay up to date with your activity</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="text-primary hover:text-primary/80 gap-1.5">
                        <CheckCheck size={15} />
                        <span className="hidden sm:inline">Mark all read</span>
                    </Button>
                )}
            </div>

            <Tabs value={filter} onValueChange={setFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-11 mb-6">
                    <TabsTrigger value="all" className="text-sm font-medium">All</TabsTrigger>
                    <TabsTrigger value="unread" className="text-sm font-medium">
                        Unread {unreadCount > 0 && `(${unreadCount})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filter} className="animate-in fade-in duration-200">
                    {loading ? (
                        <div className="space-y-3">
                            <NotifSkeleton /><NotifSkeleton /><NotifSkeleton />
                        </div>
                    ) : notifications.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none mt-4">
                            <CardContent className="flex flex-col items-center justify-center py-14 text-center gap-3 text-muted-foreground">
                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                    <Bell size={26} className="text-muted-foreground/60" />
                                </div>
                                <p className="font-semibold text-foreground">
                                    {filter === "unread" ? "You're all caught up!" : "No notifications yet"}
                                </p>
                                <p className="text-sm max-w-[260px]">
                                    {filter === "unread"
                                        ? "No unread notifications right now."
                                        : "When you receive notifications, they'll appear here."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map(notif => {
                                const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.like
                                const IconComp = config.icon
                                return (
                                    <Card
                                        key={notif._id}
                                        onClick={() => !notif.isRead && markAsRead(notif._id)}
                                        className={cn(
                                            "transition-all cursor-pointer group",
                                            notif.isRead
                                                ? "bg-transparent border-border/40 shadow-none"
                                                : "bg-muted/20 border-border/60 hover:bg-muted/30 shadow-sm"
                                        )}
                                    >
                                        <CardContent className="p-4 flex items-start gap-3">
                                            <div className={cn(
                                                "shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center",
                                                config.bg
                                            )}>
                                                <IconComp size={18} className={config.color} />
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <Link href={`/profile/${notif.sender?._id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 mb-1 group w-fit">
                                                    <Avatar className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110">
                                                        <AvatarImage src={notif.sender?.image || "/default-avatar.png"} />
                                                        <AvatarFallback className="text-[9px]">U</AvatarFallback>
                                                    </Avatar>
                                                    <p className="text-sm text-foreground leading-snug">
                                                        <span className="font-semibold group-hover:underline">{notif.sender?.name || "Someone"}</span>{" "}
                                                        <span className="text-muted-foreground">{NOTIF_TEXT[notif.type] || "interacted with you"}</span>
                                                    </p>
                                                </Link>
                                                <p className="text-xs text-muted-foreground/70">{formatTime(notif.createdAt)}</p>
                                            </div>

                                            <div className="flex flex-col items-center gap-3 shrink-0">
                                                {!notif.isRead ? (
                                                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                                ) : (
                                                    <div className="w-2 h-2 mt-1.5" />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id) }}
                                                    className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
