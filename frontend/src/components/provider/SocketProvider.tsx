import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { initializeSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

// Create socket context
interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

// Custom hook to use socket
export const useSocket = () => useContext(SocketContext);

// Socket provider component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {

        const socketInstance = initializeSocket();
        setSocket(socketInstance);

        // Set up connection event listeners
        const onConnect = () => {
            console.log("Socket connected");
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        };

        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);

        // Set initial connection state
        setIsConnected(socketInstance.connected);

        // Cleanup function
        return () => {
            socketInstance.off("connect", onConnect);
            socketInstance.off("disconnect", onDisconnect);
            disconnectSocket();
        };

    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}; 