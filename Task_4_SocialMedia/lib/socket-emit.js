import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
    if (typeof window !== "undefined") {
        return null; // Client side should use context/SocketContext.js
    }

    if (!socket) {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
        socket = io(socketUrl, {
            query: { userId: "server-process" },
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
            console.log("🔌 Server-side Socket Client connected successfully");
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Server-side Socket Client connection error:", err.message);
        });
    }

    return socket;
}

export function emitToUser(recipientId, eventName, payload) {
    const s = getSocket();
    if (s && s.connected) {
        s.emit("notify", {
            recipientId,
            notification: {
                ...payload,
                customEvent: eventName, // Custom attribute if we need it
            },
        });
        // We can also let the socket server directly emit custom events to the room
        s.emit("server_forward", { recipientId, eventName, payload });
        return true;
    } else {
        // Fallback: if not connected, try to establish connection and send
        const freshSocket = getSocket();
        if (freshSocket) {
            freshSocket.emit("notify", {
                recipientId,
                notification: {
                    ...payload,
                    customEvent: eventName,
                },
            });
            freshSocket.emit("server_forward", { recipientId, eventName, payload });
            return true;
        }
    }
    return false;
}
