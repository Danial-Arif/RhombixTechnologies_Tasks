'use client'

import { useEffect, useState } from "react"
import PostCard from "./PostCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Inbox } from "lucide-react"

function PostSkeleton() {
    return (
        <Card className="border-border/60">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </CardContent>
        </Card>
    )
}

export default function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true)
                const res = await fetch("/api/posts")
                if (!res.ok) throw new Error("Failed to fetch posts")
                const data = await res.json()
                setPosts(data.posts || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchPosts()
    }, [])

    return (
        <div className="space-y-4">

            {loading && (
                <div className="space-y-4">
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}

            {error && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-8 text-center text-sm text-destructive">
                        {error}
                    </CardContent>
                </Card>
            )}

            {!loading && !error && posts.length === 0 && (
                <Card className="border-dashed border-2 border-border/50 bg-transparent shadow-none">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                            <Inbox size={28} className="text-muted-foreground/60" />
                        </div>
                        <p className="font-medium text-base text-foreground">No posts yet</p>
                        <p className="text-sm">Create the first post to get the conversation started!</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && posts.length > 0 && (
                <div className="space-y-4">
                    {posts.map(post => (
                        <PostCard key={post._id || post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    )
}