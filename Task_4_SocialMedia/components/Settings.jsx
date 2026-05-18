'use client'

import { useState, useEffect } from "react"
import {
    Shield, Eye, Bell, UserX, Lock, Users,
    MessageCircle, UserPlus, Loader2, Check
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const PRIVACY_OPTIONS = {
    profileVisibility: {
        label: "Profile Visibility",
        description: "Who can see your profile",
        icon: Eye,
        options: [
            { value: "public", label: "Public" },
            { value: "friends", label: "Friends Only" },
            { value: "private", label: "Private" },
        ],
    },
    showFollowers: {
        label: "Show Followers",
        description: "Who can see your followers list",
        icon: Users,
        options: [
            { value: "everyone", label: "Everyone" },
            { value: "friends", label: "Friends Only" },
            { value: "nobody", label: "Nobody" },
        ],
    },
    showFollowing: {
        label: "Show Following",
        description: "Who can see who you follow",
        icon: Users,
        options: [
            { value: "everyone", label: "Everyone" },
            { value: "friends", label: "Friends Only" },
            { value: "nobody", label: "Nobody" },
        ],
    },
    showFriends: {
        label: "Show Friends",
        description: "Who can see your friends list",
        icon: Users,
        options: [
            { value: "everyone", label: "Everyone" },
            { value: "friends", label: "Friends Only" },
            { value: "nobody", label: "Nobody" },
        ],
    },
    allowMessages: {
        label: "Allow Messages",
        description: "Who can send you messages",
        icon: MessageCircle,
        options: [
            { value: "everyone", label: "Everyone" },
            { value: "friends", label: "Friends Only" },
            { value: "nobody", label: "Nobody" },
        ],
    },
    allowFriendRequests: {
        label: "Allow Friend Requests",
        description: "Who can send you friend requests",
        icon: UserPlus,
        options: [
            { value: "everyone", label: "Everyone" },
            { value: "nobody", label: "Nobody" },
        ],
    },
}

export default function Settings({ userId }) {
    const [activeSection, setActiveSection] = useState("privacy")
    const [privacy, setPrivacy] = useState({
        profileVisibility: "public",
        showFollowers: "everyone",
        showFollowing: "everyone",
        showFriends: "everyone",
        allowMessages: "everyone",
        allowFriendRequests: "everyone",
    })
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [blockedUsers, setBlockedUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Fetch user settings
    useEffect(() => {
        if (!userId) return
        setLoading(true)

        fetch(`/api/users/${userId}?viewerId=${userId}`)
            .then(r => r.json())
            .then(data => {
                if (data.user) {
                    setPrivacy({
                        profileVisibility: data.user.privacy?.profileVisibility || "public",
                        showFollowers: data.user.privacy?.showFollowers || "everyone",
                        showFollowing: data.user.privacy?.showFollowing || "everyone",
                        showFriends: data.user.privacy?.showFriends || "everyone",
                        allowMessages: data.user.privacy?.allowMessages || "everyone",
                        allowFriendRequests: data.user.privacy?.allowFriendRequests || "everyone",
                    })
                    setNotificationsEnabled(data.user.notificationsEnabled !== false)
                    setBlockedUsers(data.user.blockedUsers || [])
                }
            })
            .catch(err => console.error("Fetch settings error:", err))
            .finally(() => setLoading(false))
    }, [userId])

    // Save privacy settings
    const savePrivacy = async () => {
        if (!userId) return
        setSaving(true)
        setSaved(false)

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    privacy,
                    notificationsEnabled,
                }),
            })

            if (res.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
            }
        } catch (err) {
            console.error("Save error:", err)
        } finally {
            setSaving(false)
        }
    }

    // Unblock user
    const handleUnblock = async (blockedId) => {
        const res = await fetch(`/api/users/${blockedId}/block`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        })

        if (res.ok) {
            setBlockedUsers(prev => prev.filter(u =>
                (typeof u === 'string' ? u : u._id) !== blockedId
            ))
        }
    }

    const sections = [
        { key: "privacy", label: "Privacy", icon: Shield, desc: "Control who sees your content" },
        { key: "notifications", label: "Notifications", icon: Bell, desc: "Manage your email and push alerts" },
        { key: "blocked", label: "Blocked Users", icon: UserX, desc: "Manage accounts you have blocked" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 w-full">
                <Loader2 size={36} className="animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full pb-10">
            {/* Settings Navigation Sidebar */}
            <div className="w-full md:w-56 shrink-0">
                <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {sections.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal text-left border ${activeSection === key
                                    ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                    : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <Icon size={18} className={activeSection === key ? "text-primary" : "text-muted-foreground"} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings Content Area */}
            <div className="flex-1 min-w-0">
                {/* ── Privacy Settings ── */}
                {activeSection === "privacy" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <Shield size={20} className="text-primary" />
                                    <CardTitle>Privacy Controls</CardTitle>
                                </div>
                                <CardDescription>Adjust who can view your profile and interact with you.</CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y divide-border/50 p-0">
                                {Object.entries(PRIVACY_OPTIONS).map(([key, config]) => {
                                    const Icon = config.icon
                                    return (
                                        <div key={key} className="p-5 flex flex-col gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border mt-0.5">
                                                    <Icon size={18} className="text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{config.label}</p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 pl-14 w-full sm:max-w-md items-stretch">
                                                {config.options.map(opt => {
                                                    const isSelected = privacy[key] === opt.value;
                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => setPrivacy(prev => ({ ...prev, [key]: opt.value }))}
                                                            className={`w-full px-4 py-3 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${isSelected
                                                                    ? "bg-primary/10 text-primary border-primary/40 shadow-sm"
                                                                    : "bg-background text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                                                                }`}
                                                        >
                                                            <span>{opt.label}</span>
                                                            {isSelected && <Check size={14} className="text-primary shrink-0" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                            <CardFooter className="p-6 bg-muted/10 border-t border-border/50">
                                <Button
                                    onClick={savePrivacy}
                                    disabled={saving}
                                    className="w-full sm:w-auto ml-auto"
                                    size="lg"
                                >
                                    {saving ? (
                                        <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</>
                                    ) : saved ? (
                                        <><Check size={18} className="mr-2 text-emerald-400" /> Saved Successfully</>
                                    ) : (
                                        <><Lock size={18} className="mr-2" /> Save Privacy Settings</>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* ── Notifications Settings ── */}
                {activeSection === "notifications" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <Bell size={20} className="text-primary" />
                                    <CardTitle>Notification Preferences</CardTitle>
                                </div>
                                <CardDescription>Choose how and when you want to be notified.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                                            <Bell size={18} className="text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Push Notifications</p>
                                            <p className="text-sm text-muted-foreground mt-0.5">Receive notifications for activity on your account</p>
                                        </div>
                                    </div>
                                    <div className="pl-14 sm:pl-0">
                                        <button
                                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${notificationsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${notificationsEnabled ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 bg-muted/10 border-t border-border/50">
                                <Button
                                    onClick={savePrivacy}
                                    disabled={saving}
                                    className="w-full sm:w-auto ml-auto"
                                    size="lg"
                                >
                                    {saving ? (
                                        <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</>
                                    ) : saved ? (
                                        <><Check size={18} className="mr-2 text-emerald-400" /> Saved Successfully</>
                                    ) : (
                                        <><Lock size={18} className="mr-2" /> Save Preferences</>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* ── Blocked Users ── */}
                {activeSection === "blocked" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <UserX size={20} className="text-destructive" />
                                    <CardTitle>Blocked Users</CardTitle>
                                </div>
                                <CardDescription>Accounts you have blocked cannot view your profile or message you.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {blockedUsers.length === 0 ? (
                                    <div className="py-16 text-center px-4">
                                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                            <UserX size={32} className="text-muted-foreground/60" />
                                        </div>
                                        <p className="text-lg font-semibold text-foreground mb-1">No blocked users</p>
                                        <p className="text-sm text-muted-foreground">
                                            Users you block will appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {blockedUsers.map(user => {
                                            const id = typeof user === "string" ? user : user._id
                                            const name = typeof user === "string" ? "Unknown User" : user.name
                                            const username = typeof user === "string" ? "" : user.username
                                            const image = typeof user === "string" ? "" : user.image

                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center justify-between gap-3 p-5 hover:bg-muted/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-1 ring-border">
                                                            <AvatarImage src={image || "/default-avatar.png"} alt={name} />
                                                            <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-foreground font-semibold text-sm sm:text-base truncate">{name}</p>
                                                            {username && <p className="text-muted-foreground text-xs sm:text-sm truncate">@{username}</p>}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUnblock(id)}
                                                        className="shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
                                                    >
                                                        Unblock
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
