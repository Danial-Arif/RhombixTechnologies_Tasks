import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import PostActions from "./PostActions"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

function timeAgo(date) {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
        return new Date(date).toLocaleDateString()
    }
}

export default function PostCard({ post }) {
    return (
        <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center gap-3 space-y-0">
                <Link href={`/profile/${post.author?._id || post.author}`} className="flex items-center gap-3 group">
                    <Avatar className="w-10 h-10 ring-2 ring-border shrink-0 transition-transform group-hover:scale-105">
                        <AvatarImage src={post.author?.image || "/default-avatar.png"} alt={post.author?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {post.author?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate group-hover:underline">
                            {post.author?.name || "Anonymous User"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            @{post.author?.username || "user"} · {timeAgo(post.createdAt)}
                        </p>
                    </div>
                </Link>
            </CardHeader>

            <CardContent className="pt-0 pb-3">
                {post.content && (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </p>
                )}

                {post.media && post.media.length > 0 && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-border/50">
                        <img
                            src={post.media[0].url}
                            alt="Post media"
                            className="w-full h-auto max-h-[480px] object-cover hover:scale-[1.01] transition-transform duration-500"
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 border-t border-border/40">
                <PostActions post={post} />
            </CardFooter>
        </Card>
    )
}