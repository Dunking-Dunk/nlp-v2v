from typing import Optional, List
import datetime
from enum import Enum
from pydantic import BaseModel, Field


from utils import execute_db_operation


# Enum types matching the Prisma schema
class SessionStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EMERGENCY_VERIFIED = "EMERGENCY_VERIFIED"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    DROPPED = "DROPPED"
    TRANSFERRED = "TRANSFERRED"
    NON_EMERGENCY = "NON_EMERGENCY"

class EmergencyType(str, Enum):
    MEDICAL = "MEDICAL"
    POLICE = "POLICE"
    FIRE = "FIRE"
    OTHER = "OTHER"

class ResponderType(str, Enum):
    AMBULANCE = "AMBULANCE"
    POLICE = "POLICE"
    FIRE = "FIRE"
    OTHER = "OTHER"

class ResponderStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    DISPATCHED = "DISPATCHED"
    ON_ROUTE = "ON_ROUTE"
    ON_SCENE = "ON_SCENE"
    RETURNING = "RETURNING"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"

class DispatchStatus(str, Enum):
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class SpeakerType(str, Enum):
    AGENT = "AGENT"
    CALLER = "CALLER"
    SYSTEM = "SYSTEM"

class CallerInput(BaseModel):
    phoneNumber: Optional[str] = None
    name: Optional[str] = None
    language: Optional[str] = Field(default="Tamil")

class LocationInput(BaseModel):
    address: Optional[str] = None
    landmark: Optional[str] = None
    gpsCoordinates: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None

class SessionInput(BaseModel):
    callerId: Optional[str] = None
    phoneNumber: Optional[str] = None
    emergencyType: Optional[EmergencyType] = None
    locationId: Optional[str] = None
    description: Optional[str] = None
    priorityLevel: Optional[int] = Field(default=3, ge=1, le=5)
    responseNotes: Optional[str] = None

class SessionTranscriptInput(BaseModel):
    sessionId: str
    speakerType: SpeakerType
    content: str
    timestamp: Optional[datetime.datetime] = None

class ResponderInput(BaseModel):
    responderType: ResponderType
    identifier: str
    status: ResponderStatus = Field(default=ResponderStatus.AVAILABLE)
    locationId: Optional[str] = None

class DispatchInput(BaseModel):
    sessionId: str
    responderId: str
    notes: Optional[str] = None

# Database operation functions
async def create_caller(data: CallerInput):
    """Create a new caller in the database"""
    async def operation(client, data):
        return await client.caller.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_location(data: LocationInput):
    """Create a new location in the database"""
    async def operation(client, data):
        return await client.location.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_session(data: SessionInput):
    """Create a new session in the database"""
    async def operation(client, data):
        return await client.session.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_session_transcript(data: SessionTranscriptInput):
    """Create a new session transcript entry in the database"""
    async def operation(client, data):
        return await client.sessiontranscript.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_responder(data: ResponderInput):
    """Create a new responder in the database"""
    async def operation(client, data):
        return await client.responder.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_dispatch(data: DispatchInput):
    """Create a new dispatch in the database"""
    async def operation(client, data):
        return await client.dispatch.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def update_session(session_id: str, data: dict):
    """Update a session in the database"""
    async def operation(client, session_id, data):
        return await client.session.update(
            where={"id": session_id},
            data=data
        )
    
    return await execute_db_operation(operation, session_id, data)

async def find_available_responders(emergency_type: EmergencyType, location_id: Optional[str] = None):
    """Find available responders for an emergency"""
    async def operation(client, emergency_type, location_id):
        responder_type = None
        
        # Map emergency type to responder type
        if emergency_type == EmergencyType.MEDICAL:
            responder_type = ResponderType.AMBULANCE
        elif emergency_type == EmergencyType.POLICE:
            responder_type = ResponderType.POLICE
        elif emergency_type == EmergencyType.FIRE:
            responder_type = ResponderType.FIRE
        
        if not responder_type:
            return []
        
        query = {
            "where": {
                "responderType": responder_type,
                "status": ResponderStatus.AVAILABLE
            }
        }
        
        if location_id:
            query["where"]["locationId"] = location_id
            
        return await client.responder.find_many(**query)
    
    return await execute_db_operation(operation, emergency_type, location_id) 