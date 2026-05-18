import CreatePost from "@/components/feed/CreatePost";
import { PlusSquare } from "lucide-react";

export default function Create() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <PlusSquare size={18} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Post</h1>
                    <p className="text-sm text-muted-foreground">Share something with your network</p>
                </div>
            </div>
            <CreatePost />
        </div>
    );
}
