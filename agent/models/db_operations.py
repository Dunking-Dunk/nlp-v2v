import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

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

