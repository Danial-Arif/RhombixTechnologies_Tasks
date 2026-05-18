/**
 * Standalone Socket.io server
 * Run with: node server.js
 * This runs alongside the Next.js dev server
 */
const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Track online users: userId → Set<socketId>
const onlineUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) {
        socket.disconnect();
        return;
    }

    // Register user
    socket.join(userId);
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    console.log(`✅ User ${userId} connected (socket: ${socket.id})`);

    // Broadcast online status
    io.emit("user_online", { userId, isOnline: true });

    // ── Typing ────────────────────────────────────────
    socket.on("typing", ({ conversationId, recipientIds, isTyping }) => {
        if (!recipientIds?.length) return;
        recipientIds.forEach((id) => {
            io.to(id).emit("typing", {
                senderId: userId,
                conversationId,
                isTyping,
            });
        });
    });

    // ── Message ───────────────────────────────────────
    socket.on("message", ({ conversationId, recipientIds, message }) => {
        if (!recipientIds?.length) return;
        recipientIds.forEach((id) => {
            io.to(id).emit("new_message", { conversationId, message });
        });
    });

    // ── Read receipt ──────────────────────────────────
    socket.on("read", ({ conversationId, recipientIds }) => {
        if (!recipientIds?.length) return;
        recipientIds.forEach((id) => {
            io.to(id).emit("messages_read", {
                conversationId,
                readBy: userId,
            });
        });
    });

    // ── Notification ──────────────────────────────────
    socket.on("notify", ({ recipientId, notification }) => {
        io.to(recipientId).emit("new_notification", { notification });
    });

    // ── Follow ────────────────────────────────────────
    socket.on("follow", ({ targetId, followerInfo }) => {
        io.to(targetId).emit("new_follower", { follower: followerInfo });
        io.to(targetId).emit("new_notification", {
            notification: {
                type: "follow",
                sender: followerInfo,
                createdAt: new Date(),
            },
        });
    });

    // ── Friend request ────────────────────────────────
    socket.on("friend_request", ({ targetId, senderInfo }) => {
        io.to(targetId).emit("friend_request", { sender: senderInfo });
        io.to(targetId).emit("new_notification", {
            notification: {
                type: "friend_request",
                sender: senderInfo,
                createdAt: new Date(),
            },
        });
    });

    // ── Friend accepted ───────────────────────────────
    socket.on("friend_accepted", ({ targetId, acceptorInfo }) => {
        io.to(targetId).emit("friend_accepted", {
            userId,
            acceptor: acceptorInfo,
        });
    });

    // ── Server Forward ────────────────────────────────
    socket.on("server_forward", ({ recipientId, eventName, payload }) => {
        if (!recipientId) return;
        io.to(recipientId).emit(eventName, payload);
    });

    // ── Disconnect ────────────────────────────────────
    socket.on("disconnect", () => {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
                onlineUsers.delete(userId);
                io.emit("user_online", { userId, isOnline: false });
            }
        }
        console.log(`❌ User ${userId} disconnected (socket: ${socket.id})`);
    });
});

httpServer.listen(PORT, () => {
    console.log(`🔌 Socket.io server running on port ${PORT}`);
});
