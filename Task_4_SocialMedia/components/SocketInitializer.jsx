'use client'

// Socket.io connects automatically via SocketContext/useSocket.
// This component is kept for backward compatibility but no longer
// needs to bootstrap the server — the standalone server.js handles that.
export default function SocketInitializer() {
    return null;
}