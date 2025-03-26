from typing import Optional, List
from models.db_operations import CallerInput, LocationInput, SessionInput, ResponderInput, DispatchInput, EmergencyType, ResponderType, ResponderStatus, SessionStatus,DispatchStatus, SessionTranscriptInput

from utils import execute_db_operation

async def create_caller(data: CallerInput):
    """Create a new caller in the database"""
    async def operation(client, data):
        return await client.caller.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_location(data: LocationInput):
    async def operation(client, data):
        return await client.location.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_session(data: SessionInput):
    async def operation(client, data):
        return await client.session.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_session_transcript(data: SessionTranscriptInput):
    async def operation(client, data):
        return await client.sessiontranscript.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_responder(data: ResponderInput):
    async def operation(client, data):
        return await client.responder.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_dispatch(data: DispatchInput):
    async def operation(client, data):
        return await client.dispatch.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def update_session(session_id: str, data: dict):
    async def operation(client, session_id, data):
        return await client.session.update(
            where={"id": session_id},
            data=data
        )
    
    return await execute_db_operation(operation, session_id, data)

async def find_available_responders(emergency_type: EmergencyType, location_id: Optional[str] = None):
    async def operation(client, emergency_type, location_id):
        responder_type = None
        
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

async def update_dispatch(dispatch_id:str, data:dict):

    async def operation(client, dispatch_id, data):
        return await client.dispatch.update(
            where={"id": dispatch_id},
            data=data
        )
    
    return await execute_db_operation(operation,dispatch_id, data)
