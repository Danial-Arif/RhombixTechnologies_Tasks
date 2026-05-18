'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, MessageCircle, Share2, Loader2, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function PostActions({ post, onDeletePost }) {
    const { data: session } = useSession()
    const userId = session?.user?.id

    // Likes
    const [liked, setLiked] = useState(post.likes?.includes(userId))
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
    const [likeLoading, setLikeLoading] = useState(false)

    // Comments
    const [comments, setComments] = useState(post.comments || [])
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)

    // Share
    const [shareLabel, setShareLabel] = useState("Share")

    // Delete
    const [deleteLoading, setDeleteLoading] = useState(false)

    // ── Like ──────────────────────────────────────────────
    const handleLike = async () => {
        if (!userId || likeLoading) return
        setLikeLoading(true)

        // Optimistic update
        setLiked((prev) => !prev)
        setLikesCount((prev) => liked ? prev - 1 : prev + 1)

        try {
            const res = await fetch(`/api/posts/${post._id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            })
            const data = await res.json()

            if (!res.ok) {
                // Rollback on failure
                setLiked((prev) => !prev)
                setLikesCount((prev) => liked ? prev + 1 : prev - 1)
            } else {
                setLiked(data.liked)
                setLikesCount(data.likesCount)
            }
        } catch {
            setLiked((prev) => !prev)
            setLikesCount((prev) => liked ? prev + 1 : prev - 1)
        } finally {
            setLikeLoading(false)
        }
    }

    // ── Comment ───────────────────────────────────────────
    const handleComment = async () => {
        if (!userId || !commentText.trim() || commentLoading) return
        setCommentLoading(true)

        try {
            const res = await fetch(`/api/posts/${post._id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, content: commentText }),
            })
            const data = await res.json()

            if (res.ok) {
                setComments((prev) => [...prev, data.comment])
                setCommentText("")
            }
        } catch (err) {
            console.error("Comment failed:", err)
        } finally {
            setCommentLoading(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await fetch(`/api/posts/${post._id}/comment`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, commentId }),
            })
            if (res.ok) {
                setComments((prev) => prev.filter((c) => c._id !== commentId))
            }
        } catch (err) {
            console.error("Delete failed:", err)
        }
    }

    // ── Share ─────────────────────────────────────────────
    const handleShare = async () => {
        const url = `${window.location.origin}/posts/${post._id}`

        try {
            if (navigator.share) {
                // Native share sheet on mobile
                await navigator.share({ title: "Check this post", url })
            } else {
                await navigator.clipboard.writeText(url)
                setShareLabel("Copied!")
                setTimeout(() => setShareLabel("Share"), 2000)
            }

            // Track share count
            await fetch(`/api/posts/${post._id}/share`, { method: "POST" })
        } catch (err) {
            console.error("Share failed:", err)
        }
    }

    // ── Delete Post ────────────────────────────────────────
    const handleDeletePost = async () => {
        if (!userId || deleteLoading) return
        if (!confirm("Are you sure you want to delete this post?")) return
        
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            })

            if (res.ok) {
                if (onDeletePost) {
                    onDeletePost(post._id)
                }
            } else {
                alert("Failed to delete post")
            }
        } catch (err) {
            console.error("Delete post failed:", err)
            alert("An error occurred while deleting the post")
        } finally {
            setDeleteLoading(false)
        }
    }

    const isPostAuthor = post.author?._id === userId || post.author === userId

    return (
        <div className="w-full">
            {/* Action buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        disabled={!userId || likeLoading}
                        className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group ${liked ? "text-red-500 hover:bg-red-500/10" : ""}`}
                    >
                        <Heart
                            size={18}
                            className={`transition-all ${liked ? "fill-red-500 scale-110" : "group-hover:scale-110"}`}
                        />
                        <span>{likesCount}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowComments((prev) => !prev)}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                    >
                        <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                        <span>{comments.length}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group"
                    >
                        <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                        <span>{shareLabel}</span>
                    </Button>
                </div>

                {isPostAuthor && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDeletePost}
                        disabled={deleteLoading}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                        {deleteLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Trash2 size={18} />
                        )}
                    </Button>
                )}
            </div>

            {/* Comments section */}
            {showComments && (
                <div className="mt-4 space-y-4 border-t pt-4">

                    {/* Comment list */}
                    {comments.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-2">No comments yet. Be the first!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="flex items-start gap-3 group">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={comment.author?.image || "/default-avatar.png"} alt={comment.author?.name} />
                                    <AvatarFallback>{comment.author?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2 border border-border">
                                    <span className="text-xs font-semibold text-primary">
                                        {comment.author?.username || comment.author?.name}
                                    </span>
                                    <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                                </div>

                                {/* Delete — only visible to comment author */}
                                {comment.author?._id === userId && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all h-8 w-8 shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}

                    {/* New comment input */}
                    {userId && (
                        <div className="flex items-center gap-2 pt-2">
                            <Input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                                placeholder="Write a comment..."
                                className="flex-1"
                            />
                            <Button
                                onClick={handleComment}
                                disabled={!commentText.trim() || commentLoading}
                                size="icon"
                                className="shrink-0"
                            >
                                {commentLoading
                                    ? <Loader2 size={16} className="animate-spin" />
                                    : <Send size={16} />
                                }
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
