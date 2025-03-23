import logging
from typing import Optional, Dict, Any, List

from .db_operations import (
    CallerInput, 
    LocationInput, 
    SessionInput, 
    ResponderInput,
    DispatchInput,
    EmergencyType,
    SessionStatus,
    create_caller,
    create_location,
    create_session,
    create_responder,
    create_dispatch,
    update_session,
    find_available_responders
)

logger = logging.getLogger("db-tools")

async def create_emergency_session(
    emergency_type: Optional[str] = None,
    description: Optional[str] = None,
    caller_phone: Optional[str] = None,
    caller_name: Optional[str] = None,
    language: Optional[str] = None,
    address: Optional[str] = None,
    landmark: Optional[str] = None,
    gps_coordinates: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    priority_level: Optional[int] = 3,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new emergency session in the database with caller and location information.
    
    Args:
        emergency_type: Type of emergency (MEDICAL, POLICE, FIRE, OTHER)
        description: Description of the emergency
        caller_phone: Phone number of the caller
        caller_name: Name of the caller
        language: Preferred language of the caller (defaults to Tamil)
        address: Address of the emergency
        landmark: Nearby landmark
        gps_coordinates: GPS coordinates (lat,long)
        city: City name
        district: District name
        priority_level: Priority level (1-5, where 1 is highest)
        notes: Additional notes about the emergency
        
    Returns:
        Dictionary with created session details including caller and location information
    """
    try:

        caller_id = None
        if caller_phone and caller_name:
            caller_data = CallerInput(
                phoneNumber=caller_phone,
                name=caller_name,
                language=language
            )
            caller = await create_caller(caller_data)
            if caller:
                caller_id = caller.id
                logger.info(f"Created caller with ID: {caller_id}")
            
        location_id = None
        if any([address, landmark, gps_coordinates, city, district]):
            location_data = LocationInput(
                address=address,
                landmark=landmark,
                gpsCoordinates=gps_coordinates,
                city=city,
                district=district
            )
            location = await create_location(location_data)
            if location:
                location_id = location.id
                logger.info(f"Created location with ID: {location_id}")
        
 
        emergency_type_enum = None
        if emergency_type:
            try:
                emergency_type_enum = EmergencyType(emergency_type.upper())
            except ValueError:
                emergency_type_enum = EmergencyType.OTHER
                logger.warning(f"Invalid emergency type: {emergency_type}, defaulting to OTHER")
        
        session_data = SessionInput(
            callerId=caller_id,
            phoneNumber=caller_phone,  
            emergencyType=emergency_type_enum,
            locationId=location_id,
            description=description,
            priorityLevel=priority_level,
            responseNotes=notes
        )
        
        session = await create_session(session_data)
        if not session:
            logger.error("Failed to create emergency session")
            return {"success": False, "error": "Failed to create emergency session"}
            
        logger.info(f"Created emergency session with ID: {session.id}")
        
        result = {
            "success": True,
            "session_id": session.id,
            "caller_id": caller_id,
            "location_id": location_id,
            "emergency_type": emergency_type_enum.value if emergency_type_enum else None,
            "timestamp": session.createdAt.isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating emergency session: {str(e)}")
        return {"success": False, "error": str(e)}


async def update_session_with_caller(
    session_id: str,
    caller_phone: str,
    caller_name: Optional[str] = None,
    language: Optional[str] = "Tamil"
) -> Dict[str, Any]:
    """
    Create a caller record and link it to an existing session.
    
    Args:
        session_id: ID of the existing session to update
        caller_phone: Phone number of the caller
        caller_name: Name of the caller
        language: Preferred language of the caller (defaults to Tamil)
        
    Returns:
        Dictionary with updated session details and caller information
    """
    try:

        if not session_id:
            return {"success": False, "error": "Session ID is required"}
        
        if not caller_phone:
            return {"success": False, "error": "Caller phone number is required"}
        

        caller_data = CallerInput(
            phoneNumber=caller_phone,
            name=caller_name,
            language=language
        )
        
        # Create the caller
        caller = await create_caller(caller_data)
        if not caller:
            logger.error("Failed to create caller")
            return {"success": False, "error": "Failed to create caller record"}
            
        caller_id = caller.id
        logger.info(f"Created caller with ID: {caller_id}")
        
        update_data = {
            "callerId": caller_id,
            "phoneNumber": caller_phone
        }
        
        updated_session = await update_session(session_id, update_data)
        if not updated_session:
            logger.error(f"Failed to update session {session_id} with caller information")
            return {"success": False, "error": "Failed to update session with caller information"}
            
        logger.info(f"Updated session {session_id} with caller ID {caller_id}")
        
        return {
            "success": True,
            "session_id": session_id,
            "caller_id": caller_id,
            "caller_phone": caller_phone,
            "caller_name": caller_name,
            "updated_at": updated_session.updatedAt.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating session with caller data: {str(e)}")
        return {"success": False, "error": str(e)}


async def update_session_with_location(
    session_id: str,
    address: Optional[str] = None,
    landmark: Optional[str] = None,
    gps_coordinates: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a location record and link it to an existing session.
    
    Args:
        session_id: ID of the existing session to update
        address: Address of the emergency
        landmark: Nearby landmark
        gps_coordinates: GPS coordinates (lat,long)
        city: City name
        district: District name
        
    Returns:
        Dictionary with updated session details and location information
    """
    try:

        if not session_id:
            return {"success": False, "error": "Session ID is required"}
        
        if not any([address, landmark, gps_coordinates, city, district]):
            return {"success": False, "error": "At least one location field is required"}
        

        location_data = LocationInput(
            address=address,
            landmark=landmark,
            gpsCoordinates=gps_coordinates,
            city=city,
            district=district
        )
        

        location = await create_location(location_data)
        if not location:
            logger.error("Failed to create location")
            return {"success": False, "error": "Failed to create location record"}
            
        location_id = location.id
        logger.info(f"Created location with ID: {location_id}")
        
 
        update_data = {
            "locationId": location_id
        }
        
        updated_session = await update_session(session_id, update_data)
        if not updated_session:
            logger.error(f"Failed to update session {session_id} with location information")
            return {"success": False, "error": "Failed to update session with location information"}
            
        logger.info(f"Updated session {session_id} with location ID {location_id}")
        
        return {
            "success": True,
            "session_id": session_id,
            "location_id": location_id,
            "address": address,
            "landmark": landmark,
            "gps_coordinates": gps_coordinates,
            "city": city,
            "district": district,
            "updated_at": updated_session.updatedAt.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating session with location data: {str(e)}")
        return {"success": False, "error": str(e)}


async def dispatch_responder(
    session_id: str,
    responder_id: Optional[str] = None,
    emergency_type: Optional[str] = None,
    location_id: Optional[str] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Dispatch a responder to an emergency session.
    If responder_id is not provided, it will find an available responder based on emergency type.
    
    Args:
        session_id: ID of the emergency session
        responder_id: ID of the responder to dispatch (optional)
        emergency_type: Type of emergency if responder needs to be found (MEDICAL, POLICE, FIRE, OTHER)
        location_id: Location ID to find nearby responders (optional)
        notes: Additional notes for the dispatch
        
    Returns:
        Dictionary with dispatch information
    """
    try:

        if not responder_id and emergency_type:
            try:
                emergency_type_enum = EmergencyType(emergency_type.upper())
            except ValueError:
                emergency_type_enum = EmergencyType.OTHER
                logger.warning(f"Invalid emergency type: {emergency_type}, defaulting to OTHER")
                
            available_responders = await find_available_responders(emergency_type_enum, location_id)
            
            if not available_responders or len(available_responders) == 0:
                logger.error(f"No available responders found for emergency type: {emergency_type}")
                return {"success": False, "error": "No available responders found"}
                

            responder_id = available_responders[0].id
            logger.info(f"Found available responder: {responder_id}")
        
        if not responder_id:
            logger.error("No responder ID provided and no available responders found")
            return {"success": False, "error": "No responder ID provided"}
            

        dispatch_data = DispatchInput(
            sessionId=session_id,
            responderId=responder_id,
            notes=notes
        )
        
        dispatch = await create_dispatch(dispatch_data)
        if not dispatch:
            logger.error("Failed to create dispatch")
            return {"success": False, "error": "Failed to create dispatch"}
            
        logger.info(f"Created dispatch with ID: {dispatch.id}")
        
        # Update session status to DISPATCHED
        await update_session(session_id, {"status": SessionStatus.DISPATCHED})
        
        result = {
            "success": True,
            "dispatch_id": dispatch.id,
            "session_id": session_id,
            "responder_id": responder_id,
            "timestamp": dispatch.dispatchTime.isoformat(),
            "status": dispatch.status
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error dispatching responder: {str(e)}")
        return {"success": False, "error": str(e)}


async def update_session_status(
    session_id: str,
    status: Optional[str] = None,
    description: Optional[str] = None,
    priority_level: Optional[int] = None,
    notes: Optional[str] = None,
    emergency_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update the status and other information of an existing session.
    
    Args:
        session_id: ID of the session to update
        status: New status of the session
        description: Updated description of the emergency
        priority_level: Updated priority level (1-5)
        notes: Additional or updated notes
        emergency_type: Updated emergency type
        
    Returns:
        Dictionary with updated session details
    """
    try:
        if not session_id:
            return {"success": False, "error": "Session ID is required"}
            
        update_data = {}
        
        if status:
            try:
                status_enum = SessionStatus(status)
                update_data["status"] = status_enum
            except ValueError:
                logger.warning(f"Invalid status: {status}")
                return {"success": False, "error": f"Invalid status: {status}"}
                
        if description:
            update_data["description"] = description
            
        if priority_level is not None:
            if priority_level < 1 or priority_level > 5:
                logger.warning(f"Invalid priority level: {priority_level}")
                return {"success": False, "error": "Priority level must be between 1 and 5"}
            update_data["priorityLevel"] = priority_level
            
        if notes:
            update_data["responseNotes"] = notes
            
        if emergency_type:
            try:
                emergency_type_enum = EmergencyType(emergency_type.upper())
                update_data["emergencyType"] = emergency_type_enum
            except ValueError:
                logger.warning(f"Invalid emergency type: {emergency_type}")
                return {"success": False, "error": f"Invalid emergency type: {emergency_type}"}
                
        if not update_data:
            logger.warning("No update data provided")
            return {"success": False, "error": "No update data provided"}
            
        updated_session = await update_session(session_id, update_data)
        if not updated_session:
            logger.error(f"Failed to update session {session_id}")
            return {"success": False, "error": "Failed to update session"}
            
        logger.info(f"Updated session {session_id}")
        
        return {
            "success": True,
            "session_id": session_id,
            "updated_at": updated_session.updatedAt.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating session: {str(e)}")
        return {"success": False, "error": str(e)} 