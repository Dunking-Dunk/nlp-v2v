import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from './config';

let socket: Socket | null = null;

// Initialize socket connection
export const initializeSocket = (): Socket => {
    if (!socket) {
        console.log(`Initializing socket connection to ${API_CONFIG.BASE_URL}`);

        // Connect to the socket server with debug options
        socket = io('http://localhost:4000/', {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        // Connection events
        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Debug events
        socket.onAny((event, ...args) => {
            console.log(`[Socket] Received event: ${event}`, args);
        });

        socket.io.on("reconnect_attempt", (attempt) => {
            console.log(`Socket reconnection attempt: ${attempt}`);
        });

        socket.io.on("reconnect", (attempt) => {
            console.log(`Socket reconnected after ${attempt} attempts`);
        });

        socket.io.on("reconnect_error", (error) => {
            console.error("Socket reconnection error:", error);
        });

        socket.io.on("reconnect_failed", () => {
            console.error("Socket reconnection failed");
        });
    }

    return socket;
};

// Join an interview room
export const joinInterviewRoom = (interviewId: string): void => {
    if (!socket) {
        initializeSocket();
    }

    console.log(`Joining interview room: ${interviewId}`);
    socket?.emit('join-interview', interviewId);
};

// Send new transcript entry
export const sendTranscript = (interviewId: string, speakerType: string, content: string): void => {
    if (!socket) {
        initializeSocket();
    }

    console.log(`Sending transcript to room ${interviewId}: ${content.substring(0, 30)}...`);
    socket?.emit('new-transcript', {
        interviewId,
        speakerType,
        content
    });
};

// Send evaluation update
export const sendEvaluation = (interviewId: string, evaluationData: any): void => {
    if (!socket) {
        initializeSocket();
    }

    console.log(`Sending evaluation update to room ${interviewId}:`, evaluationData);
    socket?.emit('update-evaluation', {
        interviewId,
        evaluationData
    });
};

// Get the socket instance
export const getSocket = (): Socket | null => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};

// Cleanup socket connection
export const disconnectSocket = (): void => {
    if (socket) {
        console.log('Disconnecting socket');
        socket.disconnect();
        socket = null;
    }
}; 