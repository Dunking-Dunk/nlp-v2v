import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import interviewRoutes from './routes/interviewRoutes';
import candidateRoutes from './routes/candidateRoutes';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: config.corsOrigin,
        credentials: true,
    }
});

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/candidates', candidateRoutes);

// Error handling middleware
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id} with headers:`, socket.handshake.headers.origin);

    // Keep track of which interviews each socket is associated with
    const userInterviews = new Set();

    // Identify if the connection is from an agent
    socket.on('agent-identify', (data) => {
        const { agentId, interviewId } = data;
        console.log(`Agent ${agentId} identified for interview ${interviewId}`);

        // Join the interview room
        socket.join(`interview-${interviewId}`);
        userInterviews.add(interviewId);

        // Mark the socket as an agent
        socket.data.isAgent = true;
        socket.data.agentId = agentId;
        socket.data.interviewId = interviewId;

        // Broadcast to all clients in the room that an agent has connected
        console.log(`Broadcasting agent-connected event to room interview-${interviewId}`);
        io.to(`interview-${interviewId}`).emit('agent-connected', {
            interviewId,
            agentId,
            timestamp: new Date().toISOString()
        });
    });

    // Join interview room when a user opens an interview detail page
    socket.on('join-interview', (interviewId) => {
        socket.join(`interview-${interviewId}`);
        userInterviews.add(interviewId);
        console.log(`User ${socket.id} joined interview-${interviewId}`);

        // Log all active rooms for this socket
        console.log(`Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));

        // Log all sockets in this room
        const roomSockets = io.sockets.adapter.rooms.get(`interview-${interviewId}`);
        console.log(`Room interview-${interviewId} has ${roomSockets ? roomSockets.size : 0} connected clients`);
    });

    // Listen for new transcript entries
    socket.on('new-transcript', async (data) => {
        try {
            const { interviewId, speakerType, content } = data;
            console.log(`New transcript entry: ${content}`);

            // Save to database using Prisma
            const transcriptEntry = await prisma.interviewTranscript.create({
                data: {
                    interviewId,
                    speakerType,
                    content
                }
            });

            // Broadcast to all users in the interview room
            console.log(`Broadcasting transcript-update to room interview-${interviewId}`);
            io.to(`interview-${interviewId}`).emit('transcript-update', transcriptEntry);
        } catch (error) {
            console.error('Error saving transcript:', error);
            socket.emit('error', { message: 'Failed to save transcript' });
        }
    });

    // Listen for evaluation updates
    socket.on('update-evaluation', async (data) => {
        try {
            const { interviewId, evaluationData } = data;
            console.log(`Received evaluation update for interview ${interviewId}:`, evaluationData);

            // Update in database
            const updatedInterview = await prisma.interview.update({
                where: { id: interviewId },
                data: evaluationData
            });

            // Broadcast to all users in the interview room
            console.log(`Broadcasting evaluation-update to room interview-${interviewId}`);
            io.to(`interview-${interviewId}`).emit('evaluation-update', updatedInterview);
        } catch (error) {
            console.error('Error updating evaluation:', error);
            socket.emit('error', { message: 'Failed to update evaluation' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}, was agent: ${socket.data.isAgent || false}`);

        // If this was an agent, notify all clients in the room
        if (socket.data.isAgent && socket.data.interviewId) {
            console.log(`Broadcasting agent-disconnected event for interview ${socket.data.interviewId}`);
            io.to(`interview-${socket.data.interviewId}`).emit('agent-disconnected', {
                interviewId: socket.data.interviewId,
                agentId: socket.data.agentId,
                timestamp: new Date().toISOString()
            });
        }

        // Clean up the rooms this socket was in
        userInterviews.forEach(interviewId => {
            socket.leave(`interview-${interviewId}`);
        });
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to database');

        server.listen(config.port, () => {
            console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
            console.log(`Socket.io server is running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer(); 