'use client'

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocketContext } from "@/context/SocketContext";
import { Send, Loader2, ImagePlus, X, ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatWindow({ conversation, onBack }) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { emit, on } = useSocketContext();

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const bottomRef = useRef(null);
    const typingTimer = useRef(null);

    const hasConversation = conversation && conversation.participants;
    const otherParticipants = hasConversation
        ? conversation.participants.filter((p) => p._id !== userId)
        : [];
    const recipientIds = otherParticipants.map((p) => p._id);

    // ── Load message history ───────────────────────────────
    useEffect(() => {
        if (!hasConversation || !userId) {
            setMessages([]);
            setIsLoadingHistory(false);
            return;
        }

        const load = async () => {
            setIsLoadingHistory(true);
            try {
                const res = await fetch(
                    `/api/conversations/${conversation._id}/messages?userId=${userId}`
                );
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error("Load messages error:", err);
            }
            setIsLoadingHistory(false);
        };
        load();
    }, [hasConversation ? conversation._id : null, userId]);

    // ── WebSocket listeners ────────────────────────────────
    useEffect(() => {
        if (!hasConversation) return;

        const unsubMessage = on("new_message", (data) => {
            if (data.conversationId === conversation._id) {
                setMessages((prev) => {
                    if (prev.find((m) => m._id === data.message._id)) return prev;
                    return [...prev, data.message];
                });
                emit("read", {
                    conversationId: conversation._id,
                    recipientIds,
                });
            }
        });

        const unsubTyping = on("typing", (data) => {
            if (data.conversationId !== conversation._id) return;
            setTypingUsers((prev) => {
                const next = new Set(prev);
                if (data.isTyping) next.add(data.senderId);
                else next.delete(data.senderId);
                return next;
            });
        });

        const unsubRead = on("messages_read", (data) => {
            if (data.conversationId === conversation._id) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.sender._id === userId || m.sender === userId
                            ? { ...m, isSeen: true }
                            : m
                    )
                );
            }
        });

        return () => {
            unsubMessage();
            unsubTyping();
            unsubRead();
        };
    }, [hasConversation ? conversation._id : null, on, emit]);

    // ── Auto-scroll ────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUsers]);

    // ── Typing indicator ───────────────────────────────────
    const handleTextChange = (e) => {
        setText(e.target.value);
        if (!hasConversation) return;
        emit("typing", { conversationId: conversation._id, recipientIds, isTyping: true });

        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            emit("typing", { conversationId: conversation._id, recipientIds, isTyping: false });
        }, 1500);
    };

    // ── Send message ───────────────────────────────────────
    const handleSend = async () => {
        if ((!text.trim() && !mediaFile) || loading || !hasConversation) return;

        setLoading(true);
        emit("typing", { conversationId: conversation._id, recipientIds, isTyping: false });

        const formData = new FormData();
        formData.append("senderId", userId);
        formData.append("content", text);
        if (mediaFile) formData.append("media", mediaFile);

        try {
            const res = await fetch(`/api/conversations/${conversation._id}/messages`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => [...prev, data.message]);
                emit("message", {
                    conversationId: conversation._id,
                    recipientIds,
                    message: data.message,
                });
                setText("");
                setMediaFile(null);
            }
        } catch (err) {
            console.error("Send failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // ── Empty state ────────────────────────────────────────
    if (!hasConversation) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Select a conversation to start chatting
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background rounded-2xl md:border border-border md:overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/20">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground shrink-0 transition-colors mr-1 border border-border/40 shadow-sm"
                        aria-label="Go back to list"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}
                {otherParticipants.map((p) => (
                    <div key={p._id} className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="w-10 h-10 ring-2 ring-background">
                                <AvatarImage src={p.image || "/default-avatar.png"} alt={p.name} />
                                <AvatarFallback>{p.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            {p.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-foreground text-sm tracking-tight">{p.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {`@${p.username || p.email?.split("@")[0] || "user"}`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {isLoadingHistory ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium">
                        No messages yet. Say hello! 👋
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.sender?._id === userId || msg.sender === userId;
                        return (
                            <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2 group`}>
                                {!isOwn && (
                                    <Avatar className="w-8 h-8 self-end mb-1">
                                        <AvatarImage src={msg.sender?.image || "/default-avatar.png"} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                                        {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                        {msg.media?.url && (
                                            msg.media.url.match(/\.(mp4|webm)$/i)
                                                ? <video src={msg.media.url} controls className="rounded-lg max-w-full mt-2 border border-border/10" />
                                                : <img src={msg.media.url} className="rounded-lg max-w-full mt-2 border border-border/10" alt="" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-muted-foreground font-medium">{formatTime(msg.createdAt)}</span>
                                        {isOwn && (
                                            <span className="text-[10px] text-primary/80 font-bold tracking-tighter">
                                                {msg.isSeen ? "✓✓" : "✓"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="bg-muted rounded-2xl px-4 py-2.5 flex gap-1.5 border border-border/50">
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 150}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Media preview */}
            {mediaFile && (
                <div className="px-5 pb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-muted border border-border px-3 py-1.5 rounded-lg text-primary font-medium flex items-center gap-2">
                        {mediaFile.name}
                        <button onClick={() => setMediaFile(null)} className="hover:text-destructive transition-colors"><X size={14} /></button>
                    </span>
                </div>
            )}

            {/* Input */}
            <div className="px-5 py-4 border-t border-border flex items-center gap-3 bg-muted/10">
                <label className="cursor-pointer text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-full shrink-0 flex items-center justify-center h-12 w-12">
                    <ImagePlus size={22} />
                    <input
                        type="file"
                        accept="image/*,video/mp4,video/webm,application/pdf"
                        className="hidden"
                        onChange={(e) => setMediaFile(e.target.files[0])}
                    />
                </label>

                <Input
                    type="text"
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 h-12 rounded-xl bg-muted/50 border-border"
                />

                <Button
                    onClick={handleSend}
                    disabled={(!text.trim() && !mediaFile) || loading}
                    size="icon"
                    className="h-12 w-12 rounded-xl shadow-md"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
                </Button>
            </div>
        </div>
    );
}