'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ImagePlus, Loader2, Send, X, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function CreatePost() {
    const { data: session } = useSession()
    const router = useRouter()
    const [content, setContent] = useState("")
    const [media, setMedia] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        const MAX_SIZE = 5 * 1024 * 1024

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Only JPEG, PNG, WebP, and GIF files are allowed.")
            return
        }
        if (file.size > MAX_SIZE) {
            setError("File size must be under 5MB.")
            return
        }

        setError("")
        setMedia(file)
        setPreview(URL.createObjectURL(file))
    }

    const clearMedia = () => {
        setMedia(null)
        setPreview(null)
    }

    const handleSubmit = async () => {
        if (!session?.user?.id) {
            router.push("/login")
            return
        }

        if (!content.trim() && !media) return

        const formData = new FormData()
        formData.append("content", content)
        formData.append("userId", session.user.id)
        if (media) formData.append("media", media)

        try {
            setLoading(true)
            setError("")

            const res = await fetch("/api/posts", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.")
                return
            }

            setContent("")
            setMedia(null)
            setPreview(null)
            router.push("/")
        } catch (err) {
            console.error("Failed to create post:", err)
            setError("Network error. Please check your connection.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
                {/* Author Row */}
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-border">
                        <AvatarImage src={session?.user?.image || "/default-avatar.png"} alt={session?.user?.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{session?.user?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">Sharing publicly</p>
                    </div>
                </div>

                {/* Text Area */}
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="min-h-[140px] resize-none bg-muted/30 border-border/50 focus-visible:ring-primary/50 text-base leading-relaxed"
                />

                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-lg">
                        <AlertCircle size={15} className="shrink-0" />
                        {error}
                    </div>
                )}

                {/* Image Preview */}
                {preview && (
                    <div className="relative rounded-xl overflow-hidden border border-border group">
                        <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
                        <button
                            onClick={clearMedia}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                <Separator />

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-3">
                    <Label
                        htmlFor="file-upload"
                        className={cn(
                            "cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-border",
                            "text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted",
                            "transition-colors"
                        )}
                    >
                        <ImagePlus size={17} className="text-primary" />
                        Add Photo
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </Label>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (!content.trim() && !media)}
                        className="gap-2 min-w-[110px]"
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" />Posting...</>
                        ) : (
                            <><Send size={16} />Publish</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}