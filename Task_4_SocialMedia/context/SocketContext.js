'use client'

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/hooks/useSocket";

const SocketContext = createContext({
    emit: () => {},
    on: () => () => {},
    isConnected: false,
    socket: null,
});

export function SocketProvider({ children }) {
    const { data: session } = useSession();
    const socketData = useSocket(session?.user?.id);

    return (
        <SocketContext.Provider value={socketData || { emit: () => {}, on: () => () => {}, isConnected: false, socket: null }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocketContext = () => useContext(SocketContext);