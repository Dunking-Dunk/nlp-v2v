import logging
import socketio
import asyncio
import os
import uuid
from typing import Dict, Any, Optional

logger = logging.getLogger("socket-client")

# Create a Socket.io client instance
sio = socketio.AsyncClient()
SOCKET_CONNECTED = False

# Generate a unique agent ID
AGENT_ID = str(uuid.uuid4())

# Get the WebSocket server URL from environment variable or use default
WEBSOCKET_URL = os.environ.get("WEBSOCKET_URL", "http://localhost:4000")

@sio.event
async def connect():
    """Handle socket connection event"""
    global SOCKET_CONNECTED
    SOCKET_CONNECTED = True
    logger.info(f"Connected to WebSocket server at {WEBSOCKET_URL}")

@sio.event
async def connect_error(data):
    """Handle connection error"""
    global SOCKET_CONNECTED
    SOCKET_CONNECTED = False
    logger.error(f"Connection error: {data}")

@sio.event
async def disconnect():
    """Handle socket disconnection"""
    global SOCKET_CONNECTED
    SOCKET_CONNECTED = False
    logger.info("Disconnected from WebSocket server")

async def connect_socket():
    """Connect to the WebSocket server"""
    global SOCKET_CONNECTED
    if not SOCKET_CONNECTED:
        try:
            await sio.connect(WEBSOCKET_URL, wait_timeout=10)
            return True
        except Exception as e:
            logger.error(f"Error connecting to WebSocket: {str(e)}")
            return False
    return True

async def join_interview_room(interview_id: str):
    """Join an interview room for real-time updates"""
    if not SOCKET_CONNECTED:
        if not await connect_socket():
            return False
    
    try:
        # First join the interview room
        await sio.emit('join-interview', interview_id)
        logger.info(f"Joined interview room: {interview_id}")
        
        # Then identify as an agent
        await sio.emit('agent-identify', {
            'agentId': AGENT_ID,
            'interviewId': interview_id,
            'name': 'Interview Agent',
            'timestamp': asyncio.get_event_loop().time()
        })
        logger.info(f"Identified as agent {AGENT_ID} for interview {interview_id}")
        
        return True
    except Exception as e:
        logger.error(f"Error joining interview room: {str(e)}")
        return False

async def send_transcript_update(interview_id: str, transcript_data: Dict[str, Any]):
    """Send a transcript update through WebSocket"""
    if not SOCKET_CONNECTED:
        if not await connect_socket():
            return False
    
    try:
        await sio.emit('new-transcript', {
            'interviewId': interview_id,
            'speakerType': transcript_data.get('speakerType'),
            'content': transcript_data.get('content')
        })
        logger.info(f"Sent transcript update for interview {interview_id}")
        return True
    except Exception as e:
        logger.error(f"Error sending transcript update: {str(e)}")
        return False

async def send_evaluation_update(interview_id: str, evaluation_data: Dict[str, Any]):
    """Send an evaluation update through WebSocket"""
    if not SOCKET_CONNECTED:
        if not await connect_socket():
            return False
    
    try:
        await sio.emit('update-evaluation', {
            'interviewId': interview_id,
            'evaluationData': evaluation_data
        })
        logger.info(f"Sent evaluation update for interview {interview_id}")
        return True
    except Exception as e:
        logger.error(f"Error sending evaluation update: {str(e)}")
        return False

async def disconnect_socket():
    """Disconnect from the WebSocket server"""
    global SOCKET_CONNECTED
    if SOCKET_CONNECTED:
        try:
            await sio.disconnect()
            return True
        except Exception as e:
            logger.error(f"Error disconnecting from WebSocket: {str(e)}")
            return False
    return True 