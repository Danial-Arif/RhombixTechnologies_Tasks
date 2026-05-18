import { NextResponse } from "next/server";

// Socket.io cannot run inside App Router route handlers because they don't expose raw HTTP sockets.
// Instead, we use a custom server (server.js) that runs Socket.io alongside Next.js.
// This route simply returns the WebSocket server status.
export async function GET() {
    return NextResponse.json({
        status: "ok",
        socketServer: global.__io ? "running" : "not initialized",
        message: "Socket.io runs on the custom server (server.js). Connect on port 3001.",
    });
}