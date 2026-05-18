import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socketInstance = null; // singleton — one socket for the whole app

export function useSocket(userId) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // If already connected with the same user, skip
        if (socketInstance?.connected && socketInstance._userId === userId) {
            setIsConnected(true);
            return;
        }

        // Disconnect previous socket if user changed
        if (socketInstance) {
            socketInstance.disconnect();
            socketInstance = null;
        }

        socketInstance = io(SOCKET_URL, {
            query: { userId },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
            transports: ["websocket", "polling"],
        });

        socketInstance._userId = userId;

        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (err) => {
            console.warn("Socket connection error:", err.message);
        });

        return () => {
            // Don't disconnect on unmount — keep alive as singleton
        };
    }, [userId]);

    const emit = useCallback((eventOrData, data) => {
        if (!socketInstance?.connected) return;

        // Support both emit("event", data) and emit({ type: "event", ...data })
        if (typeof eventOrData === "string") {
            socketInstance.emit(eventOrData, data);
        } else if (typeof eventOrData === "object" && eventOrData.type) {
            const { type, ...rest } = eventOrData;
            socketInstance.emit(type, rest);
        }
    }, []);

    const on = useCallback((event, callback) => {
        if (!socketInstance) return () => {};
        socketInstance.on(event, callback);
        return () => socketInstance?.off(event, callback);
    }, []);

    return { emit, on, isConnected, socket: socketInstance };
}