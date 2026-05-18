import Feed from "@/components/feed/Feed";
import { Sparkles } from "lucide-react";

export default function Home() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Home Feed</h1>
                    <p className="text-sm text-muted-foreground">What's happening in your network</p>
                </div>
            </div>
            <Feed />
        </div>
    );
}