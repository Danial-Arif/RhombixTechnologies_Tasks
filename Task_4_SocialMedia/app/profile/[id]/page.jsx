'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import PostCard from "@/components/feed/PostCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Link as LinkIcon, Calendar, UserPlus, UserMinus, Loader2, Inbox } from "lucide-react"
import Settings from "@/components/Settings"

export default function ProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const viewerId = session?.user?.id
    const profileId = params.id

    const [activeTab, setActiveTab] = useState("posts")
    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [loadingPosts, setLoadingPosts] = useState(true)
    const [error, setError] = useState(null)

    // Relationship status
    const [isSelf, setIsSelf] = useState(false)
    const [isFriend, setIsFriend] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    
    // Edit Profile Modal States
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editName, setEditName] = useState("")
    const [editBio, setEditBio] = useState("")
    const [editLocation, setEditLocation] = useState("")
    const [editWebsite, setEditWebsite] = useState("")
    const [editImage, setEditImage] = useState("")
    const [editCoverImage, setEditCoverImage] = useState("")
    const [editSaving, setEditSaving] = useState(false)

    useEffect(() => {
        if (profile) {
            setEditName(profile.name || "")
            setEditBio(profile.bio || "")
            setEditLocation(profile.location || "")
            setEditWebsite(profile.website || "")
            setEditImage(profile.image || "")
            setEditCoverImage(profile.coverImage || "")
        }
    }, [profile])

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        if (!editName.trim()) return
        setEditSaving(true)
        try {
            const res = await fetch(`/api/users/${profileId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: viewerId,
                    name: editName,
                    bio: editBio,
                    location: editLocation,
                    website: editWebsite,
                    image: editImage,
                    coverImage: editCoverImage,
                })
            })
            if (res.ok) {
                const data = await res.json()
                if (data.user) {
                    setProfile(prev => ({
                        ...prev,
                        ...data.user
                    }))
                }
                setIsEditingProfile(false)
            } else {
                const errorData = await res.json()
                alert(errorData.error || "Failed to update profile")
            }
        } catch (err) {
            console.error(err)
            alert("An error occurred while saving profile")
        } finally {
            setEditSaving(false)
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            if (params.get("tab") === "settings") {
                setActiveTab("settings")
            }
        }
    }, [])

    useEffect(() => {
        if (!profileId || !viewerId) return

        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/users/${profileId}?viewerId=${viewerId}`)
                if (!res.ok) throw new Error("Profile not found")
                const data = await res.json()
                setProfile(data.user)
                setIsSelf(data.isSelf)
                setIsFriend(data.isFriend)
                setIsFollowing(data.isFollowing)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoadingProfile(false)
            }
        }

        const fetchPosts = async () => {
            try {
                const res = await fetch(`/api/posts?userId=${profileId}`)
                if (!res.ok) throw new Error("Failed to fetch posts")
                const data = await res.json()
                setPosts(data.posts || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoadingPosts(false)
            }
        }

        fetchProfile()
        fetchPosts()
    }, [profileId, viewerId])

    const handleSendRequest = async () => {
        setActionLoading(true)
        try {
            await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: viewerId, targetId: profileId }),
            })
            // Optimistically assume sent
            // For a complete flow, we should probably fetch the friend status explicitly,
            // but for now, we just know it's pending.
        } finally {
            setActionLoading(false)
        }
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-foreground">User not found</h1>
                <p className="text-muted-foreground mt-2">The profile you are looking for does not exist or is private.</p>
                <Button onClick={() => router.push("/")} className="mt-6">Go Home</Button>
            </div>
        )
    }

    if (loadingProfile) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6 w-full">
                <Skeleton className="w-full h-48 rounded-xl" />
                <div className="flex gap-4 px-4">
                    <Skeleton className="w-24 h-24 rounded-full -mt-12 border-4 border-background" />
                    <div className="pt-2 space-y-2 flex-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-full  mx-auto px-4 py-6 md:py-8 space-y-6 w-full">
            {/* Profile Header */}
            <Card className="border-border/60 overflow-hidden">
                <div className="h-32 sm:h-48 bg-muted relative">
                    {profile.coverImage && (
                        <img src={profile.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    )}
                </div>
                <div className="px-4 sm:px-6 pb-6 relative">
                    <div className="flex justify-between items-start">
                        <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-full -mt-10 sm:-mt-12 ring-4 ring-background bg-muted">
                            <AvatarImage src={profile.image || "/default-avatar.png"} />
                            <AvatarFallback className="text-2xl">{profile.name?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="pt-3">
                            {isSelf ? (
                                <Button onClick={() => setIsEditingProfile(true)} variant="outline" size="sm" className="gap-2 border-border/80 hover:bg-muted text-xs font-semibold rounded-xl transition-all">
                                    Edit Profile
                                </Button>
                            ) : (
                                <Button onClick={handleSendRequest} disabled={actionLoading} size="sm" className="gap-2">
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isFriend ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                                    {isFriend ? "Friends" : "Add Friend"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-3">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{profile.name}</h1>
                        <p className="text-muted-foreground text-sm">@{profile.username}</p>
                    </div>

                    {profile.bio && (
                        <p className="mt-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {profile.bio}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground">
                        {profile.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} /> <span>{profile.location}</span>
                            </div>
                        )}
                        {profile.website && (
                            <div className="flex items-center gap-1.5">
                                <LinkIcon size={14} />
                                <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{profile.website.replace(/^https?:\/\//, '')}</a>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} /> <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6 text-sm">
                        <div className="flex gap-1.5 items-center">
                            <span className="font-bold text-foreground">{profile.friendsHidden ? "-" : (profile.friends?.length || 0)}</span>
                            <span className="text-muted-foreground">Friends</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* User Posts & Settings */}
            {isSelf ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 h-11 mb-6">
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="posts" className="space-y-4 animate-in fade-in duration-200">
                        {loadingPosts ? (
                            <div className="space-y-4">
                                <Skeleton className="h-40 w-full rounded-xl" />
                                <Skeleton className="h-40 w-full rounded-xl" />
                            </div>
                        ) : posts.length === 0 ? (
                            <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <Inbox size={24} className="text-muted-foreground/60" />
                                    </div>
                                    <p className="font-medium text-foreground">No posts yet</p>
                                </CardContent>
                            </Card>
                        ) : (
                            posts.map(post => (
                                <PostCard key={post._id} post={post} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="animate-in fade-in duration-200">
                        <Settings userId={profileId} />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="space-y-4">
                    <h2 className="font-semibold text-lg px-1">Posts</h2>

                    {loadingPosts ? (
                        <div className="space-y-4">
                            <Skeleton className="h-40 w-full rounded-xl" />
                            <Skeleton className="h-40 w-full rounded-xl" />
                        </div>
                    ) : posts.length === 0 ? (
                        <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Inbox size={24} className="text-muted-foreground/60" />
                                </div>
                                <p className="font-medium text-foreground">No posts yet</p>
                            </CardContent>
                        </Card>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))
                    )}
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-card border border-border/85 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-250">
                        <div className="border-b border-border/60 p-5 bg-muted/10">
                            <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
                            <p className="text-xs text-muted-foreground mt-1">Update your personal details, profile picture, and header image.</p>
                        </div>
                        
                        <form onSubmit={handleSaveProfile}>
                            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
                                    <textarea 
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 h-24 resize-none"
                                        placeholder="Write a short bio..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                                        <input 
                                            type="text"
                                            value={editLocation}
                                            onChange={(e) => setEditLocation(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                            placeholder="e.g. San Francisco, CA"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</label>
                                        <input 
                                            type="url"
                                            value={editWebsite}
                                            onChange={(e) => setEditWebsite(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                            placeholder="e.g. https://website.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avatar Image URL</label>
                                    <input 
                                        type="text"
                                        value={editImage}
                                        onChange={(e) => setEditImage(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                        placeholder="Paste image link for avatar"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cover Image URL</label>
                                    <input 
                                        type="text"
                                        value={editCoverImage}
                                        onChange={(e) => setEditCoverImage(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                        placeholder="Paste image link for profile header cover"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-5 bg-muted/5 border-t border-border/60">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile(false)}
                                    className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-muted text-xs font-semibold transition-all text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-55 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                    {editSaving ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
