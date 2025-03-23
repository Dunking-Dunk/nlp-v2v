import logging
from typing import Annotated, Optional
from datetime import datetime
import asyncio

from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, silero, turn_detector, google
from tools import (
    create_emergency_session, 
    dispatch_responder, 
    update_session_status,
    update_session_with_caller,
    update_session_with_location
)
from utils import ai_prompt, execute_db_operation

"""
Emergency Response Voice Agent

This agent handles emergency calls using LiveKit's voice agent capabilities.
Features:
- Speech-to-text processing of emergency calls
- LLM-based response generation
- Text-to-speech response delivery
- Emergency session management and dispatch functionality
- Detailed transcript recording of conversations

Transcript Recording:
- All user and agent messages are recorded in the SessionTranscript table
- System messages mark the beginning and end of sessions
- Speaker type (AGENT, CALLER, SYSTEM) is recorded for each entry
- Full conversation history is preserved for review and analysis
"""

load_dotenv(dotenv_path=".env.local")
logger = logging.getLogger("voice-agent")


# A function to store transcript entries in the database
async def store_session_transcript(session_id: str, speaker_type: str, content: str):
    """
    Store a new session transcript entry in the database.
    
    Args:
        session_id: ID of the session
        speaker_type: Type of speaker (AGENT, CALLER, SYSTEM)
        content: Content of the message
    
    Returns:
        The created transcript entry
    """
    try:
        async def operation(client, session_id, speaker_type, content):
            return await client.sessiontranscript.create(
                data={
                    "sessionId": session_id,
                    "speakerType": speaker_type,
                    "content": content,
                    "timestamp": datetime.now(),
                }
            )
        
        result = await execute_db_operation(operation, session_id, speaker_type, content)
        logger.info(f"Created transcript entry for session {session_id}")
        return result
    except Exception as e:
        logger.error(f"Error storing session transcript: {str(e)}")
        return None


# Function to create an initial session when a connection is established
async def initialize_session():
    """
    Create an initial empty session when a connection is established.
    This allows for immediate transcript recording.
    
    Returns:
        The session ID if successful, None otherwise
    """
    try:
        result = await create_emergency_session(
            # Initialize with minimal information
            # We'll update these details as they become available
            description="Initial session - details pending"
        )
        
        if result and "success" in result and result["success"] and "session_id" in result:
            session_id = result["session_id"]
            logger.info(f"Created initial session with ID: {session_id}")
            
            # Add a system message to mark the start of the session
            system_message = f"Emergency session initialized at {datetime.now().isoformat()}"
            await store_session_transcript(
                session_id=session_id,
                speaker_type="SYSTEM",
                content=system_message
            )
            
            return session_id
        else:
            logger.error("Failed to create initial session")
            return None
    except Exception as e:
        logger.error(f"Error initializing session: {str(e)}")
        return None


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(ai_prompt),
    )

    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")
    
    # Initialize a session as soon as the participant joins
    current_session_id = await initialize_session()
    logger.info(f"Initialized session for participant {participant.identity}: {current_session_id}")
    
    class EmergencyResponseFnc(llm.FunctionContext):
        @llm.ai_callable()
        async def create_emergency_session(
            self,
            emergency_type: Annotated[
                Optional[str], llm.TypeInfo(description="Type of emergency (MEDICAL, POLICE, FIRE, OTHER)")
            ] = None,
            description: Annotated[
                Optional[str], llm.TypeInfo(description="Description of the emergency")
            ] = None,
            caller_phone: Annotated[
                Optional[str], llm.TypeInfo(description="Phone number of the caller")
            ] = None,
            caller_name: Annotated[
                Optional[str], llm.TypeInfo(description="Name of the caller")
            ] = None,
            language: Annotated[
                Optional[str], llm.TypeInfo(description="Preferred language of the caller (defaults to Tamil)")
            ] = None,
            address: Annotated[
                Optional[str], llm.TypeInfo(description="Address of the emergency")
            ] = None,
            landmark: Annotated[
                Optional[str], llm.TypeInfo(description="Nearby landmark")
            ] = None,
            gps_coordinates: Annotated[
                Optional[str], llm.TypeInfo(description="GPS coordinates (lat,long)")
            ] = None,
            city: Annotated[
                Optional[str], llm.TypeInfo(description="City name")
            ] = None,
            district: Annotated[
                Optional[str], llm.TypeInfo(description="District name")
            ] = None,
            priority_level: Annotated[
                Optional[int], llm.TypeInfo(description="Priority level (1-5, where 1 is highest)")
            ] = 3,
            notes: Annotated[
                Optional[str], llm.TypeInfo(description="Additional notes about the emergency")
            ] = None
        ):
            """Called to create a new emergency session with all relevant details. Use this when you've gathered enough information about an emergency."""
            nonlocal current_session_id
            
            # If we already have a session, update it instead of creating a new one
            if current_session_id:
                logger.info(f"Session already exists ({current_session_id}), updating instead of creating new one")
                
                # Update session with basic emergency information
                status_result = await update_session_status(
                    session_id=current_session_id,
                    emergency_type=emergency_type,
                    description=description,
                    priority_level=priority_level,
                    notes=notes
                )
                
                # Also update caller information if provided
                caller_result = None
                if caller_phone or caller_name or language:
                    caller_result = await update_session_with_caller(
                        session_id=current_session_id,
                        caller_phone=caller_phone,
                        caller_name=caller_name,
                        language=language
                    )
                    if caller_result and caller_result.get("success"):
                        logger.info(f"Updated session {current_session_id} with caller information")
                
                # Also update location information if provided
                location_result = None
                if any([address, landmark, gps_coordinates, city, district]):
                    location_result = await update_session_with_location(
                        session_id=current_session_id,
                        address=address,
                        landmark=landmark,
                        gps_coordinates=gps_coordinates,
                        city=city,
                        district=district
                    )
                    if location_result and location_result.get("success"):
                        logger.info(f"Updated session {current_session_id} with location information")
                
                if status_result and status_result.get("success"):
                    # If any of the updates were successful, return a success
                    caller_id = caller_result.get("caller_id") if caller_result and caller_result.get("success") else None
                    location_id = location_result.get("location_id") if location_result and location_result.get("success") else None
                    
                    # Add system message about enhancing the session with details if caller or location was added
                    if (caller_result and caller_result.get("success")) or (location_result and location_result.get("success")):
                        system_message = f"Enhanced session with additional details at {datetime.now().isoformat()}"
                        asyncio.create_task(
                            store_session_transcript(
                                session_id=current_session_id,
                                speaker_type="SYSTEM",
                                content=system_message
                            )
                        )
                    
                    return {
                        "success": True,
                        "session_id": current_session_id,
                        "caller_id": caller_id,
                        "location_id": location_id,
                        "message": "Session updated with new information"
                    }
                else:
                    # If all updates failed, try to create a new session
                    logger.warning(f"Failed to update session {current_session_id}, creating new one")
                    current_session_id = None
            
            # Create a new session if we don't have one already or update failed
            if not current_session_id:
                result = await create_emergency_session(
                    emergency_type=emergency_type,
                    description=description,
                    caller_phone=caller_phone,
                    caller_name=caller_name,
                    language=language,
                    address=address,
                    landmark=landmark,
                    gps_coordinates=gps_coordinates,
                    city=city,
                    district=district,
                    priority_level=priority_level,
                    notes=notes
                )
                
                if result and "success" in result and result["success"] and "session_id" in result:
                    current_session_id = result["session_id"]
                    logger.info(f"Created new session with ID: {current_session_id}")
                
                return result
            return {"success": False, "error": "Unknown error in session handling"}
        
        @llm.ai_callable()
        async def update_session_with_caller(
            self,
            session_id: Annotated[
                Optional[str], llm.TypeInfo(description="ID of the session to update")
            ] = None,
            caller_phone: Annotated[
                str, llm.TypeInfo(description="Phone number of the caller")
            ] = None,
            caller_name: Annotated[
                Optional[str], llm.TypeInfo(description="Name of the caller")
            ] = None,
            language: Annotated[
                Optional[str], llm.TypeInfo(description="Preferred language of the caller (defaults to Tamil)")
            ] = None
        ):
            """Called to add or update caller information for an existing session. Use this when you've gathered caller details."""
            nonlocal current_session_id
            
            # If session_id not provided, use the current session
            if not session_id and current_session_id:
                session_id = current_session_id
                logger.info(f"Using current session ID: {session_id} for caller update")
            
            result = await update_session_with_caller(
                session_id=session_id,
                caller_phone=caller_phone,
                caller_name=caller_name,
                language=language
            )
            
            # If the update is successful, record it in the transcript
            if result and result.get("success"):
                system_message = f"Updated caller information: Phone: {caller_phone}, Name: {caller_name}"
                asyncio.create_task(
                    store_session_transcript(
                        session_id=session_id,
                        speaker_type="SYSTEM",
                        content=system_message
                    )
                )
            
            return result
        
        @llm.ai_callable()
        async def update_session_with_location(
            self,
            session_id: Annotated[
                Optional[str], llm.TypeInfo(description="ID of the session to update")
            ] = None,
            address: Annotated[
                Optional[str], llm.TypeInfo(description="Address of the emergency")
            ] = None,
            landmark: Annotated[
                Optional[str], llm.TypeInfo(description="Nearby landmark")
            ] = None,
            gps_coordinates: Annotated[
                Optional[str], llm.TypeInfo(description="GPS coordinates (lat,long)")
            ] = None,
            city: Annotated[
                Optional[str], llm.TypeInfo(description="City name")
            ] = None,
            district: Annotated[
                Optional[str], llm.TypeInfo(description="District name")
            ] = None
        ):
            """Called to add location information for an existing session. Use this when you've gathered location details."""
            nonlocal current_session_id
            
            # If session_id not provided, use the current session
            if not session_id and current_session_id:
                session_id = current_session_id
                logger.info(f"Using current session ID: {session_id} for location update")
            
            result = await update_session_with_location(
                session_id=session_id,
                address=address,
                landmark=landmark,
                gps_coordinates=gps_coordinates,
                city=city,
                district=district
            )
            
            # If the update is successful, record it in the transcript
            if result and result.get("success"):
                location_details = []
                if address:
                    location_details.append(f"Address: {address}")
                if landmark:
                    location_details.append(f"Landmark: {landmark}")
                if gps_coordinates:
                    location_details.append(f"GPS: {gps_coordinates}")
                if city:
                    location_details.append(f"City: {city}")
                if district:
                    location_details.append(f"District: {district}")
                
                system_message = f"Updated location information: {', '.join(location_details)}"
                asyncio.create_task(
                    store_session_transcript(
                        session_id=session_id,
                        speaker_type="SYSTEM",
                        content=system_message
                    )
                )
            
            return result
        
        @llm.ai_callable()
        async def dispatch_responder(
            self,
            session_id: Annotated[
                Optional[str], llm.TypeInfo(description="ID of the emergency session")
            ] = None,
            responder_id: Annotated[
                Optional[str], llm.TypeInfo(description="ID of the responder to dispatch")
            ] = None,
            emergency_type: Annotated[
                Optional[str], llm.TypeInfo(description="Type of emergency if responder needs to be found")
            ] = None,
            location_id: Annotated[
                Optional[str], llm.TypeInfo(description="Location ID to find nearby responders")
            ] = None,
            notes: Annotated[
                Optional[str], llm.TypeInfo(description="Additional notes for the dispatch")
            ] = None
        ):
            """Called to dispatch an appropriate responder to the emergency. Use after creating an emergency session."""
            nonlocal current_session_id
            
            # If session_id not provided, use the current session
            if not session_id and current_session_id:
                session_id = current_session_id
                logger.info(f"Using current session ID: {session_id} for dispatch")
            
            result = await dispatch_responder(
                session_id=session_id,
                responder_id=responder_id,
                emergency_type=emergency_type,
                location_id=location_id,
                notes=notes
            )
            return result
        
        @llm.ai_callable()
        async def update_session_status(
            self,
            session_id: Annotated[
                Optional[str], llm.TypeInfo(description="ID of the session to update")
            ] = None,
            status: Annotated[
                Optional[str], llm.TypeInfo(description="New status of the session (ACTIVE, EMERGENCY_VERIFIED, DISPATCHED, COMPLETED, etc.)")
            ] = None,
            description: Annotated[
                Optional[str], llm.TypeInfo(description="Updated description of the emergency")
            ] = None,
            priority_level: Annotated[
                Optional[int], llm.TypeInfo(description="Updated priority level (1-5, where 1 is highest)")
            ] = None,
            notes: Annotated[
                Optional[str], llm.TypeInfo(description="Additional response notes")
            ] = None,
            emergency_type: Annotated[
                Optional[str], llm.TypeInfo(description="Updated emergency type")
            ] = None
        ):
            """Called to update a session with new information. Use this to update session status or add information."""
            nonlocal current_session_id
            
            # If session_id not provided, use the current session
            if not session_id and current_session_id:
                session_id = current_session_id
                logger.info(f"Using current session ID: {session_id} for update")
            
            result = await update_session_status(
                session_id=session_id,
                status=status,
                description=description,
                priority_level=priority_level,
                notes=notes,
                emergency_type=emergency_type
            )
            return result

    # Create the function context instance
    fnc_ctx = EmergencyResponseFnc()

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=google.LLM(model="gemini-2.0-flash"),
        tts=deepgram.TTS(),
        turn_detector=turn_detector.EOUModel(),
        min_endpointing_delay=0.5,
        max_endpointing_delay=5.0,
        chat_ctx=initial_ctx,
        fnc_ctx=fnc_ctx
    )

    usage_collector = metrics.UsageCollector()

    @agent.on("metrics_collected")
    def on_metrics_collected(agent_metrics: metrics.AgentMetrics):
        metrics.log_metrics(agent_metrics)
        usage_collector.collect(agent_metrics)

    # Event listener for when user speech is committed
    @agent.on("user_speech_committed")
    def on_user_speech_committed(msg=None):
        try:
            nonlocal current_session_id
            
            # If we don't have a session ID yet, we can't store transcripts
            if not current_session_id:
                logger.info("No active session ID, skipping transcript storage")
                return
                
            # Skip if no message is provided
            if msg is None:
                logger.info("No message provided in user_speech_committed event, skipping transcript storage")
                return
                
            # Get the content directly - it's already a string for user messages
            content = msg.content if hasattr(msg, 'content') else str(msg)
                
            # Store the message in the database
            asyncio.create_task(
                store_session_transcript(
                    session_id=current_session_id,
                    speaker_type="CALLER",
                    content=content
                )
            )
            logger.info(f"Created task to store user speech in transcript: {content[:50]}...")
        except Exception as e:
            logger.error(f"Error processing user_speech_committed event: {str(e)}")
    
    # Event listener for when agent stops speaking
    @agent.on("agent_stopped_speaking") 
    def on_agent_stopped_speaking(msg=None):
        try:
            nonlocal current_session_id
            
            # If we don't have a session ID yet, we can't store transcripts
            if not current_session_id:
                logger.info("No active session ID, skipping transcript storage")
                return
                
            # For agent_stopped_speaking, sometimes there's no message
            # In that case, we don't need to store anything
            if msg is None:
                logger.info("No message provided in agent_stopped_speaking event, skipping transcript storage")
                return
                
            # Get the agent's response content
            content = msg.content if hasattr(msg, 'content') else str(msg)
                
            # Store the message in the database
            asyncio.create_task(
                store_session_transcript(
                    session_id=current_session_id,
                    speaker_type="AGENT",
                    content=content
                )
            )
            logger.info(f"Created task to store agent speech in transcript: {content[:50]}...")
        except Exception as e:
            logger.error(f"Error processing agent_stopped_speaking event: {str(e)}")

    # Intercept the update_session_status function to handle session end
    original_update_session_status = fnc_ctx.update_session_status
    
    async def update_session_status_wrapper(*args, **kwargs):
        nonlocal current_session_id
        result = await original_update_session_status(*args, **kwargs)
        
        # Get the session ID from the arguments or use the current one
        session_id = kwargs.get('session_id', current_session_id)
        
        # If updating the current session and status is COMPLETED, DROPPED, or TRANSFERRED
        if (session_id == current_session_id and 
            kwargs.get('status') in ['COMPLETED', 'DROPPED', 'TRANSFERRED', 'NON_EMERGENCY']):
            # Add a system message to mark the end of the session
            system_message = f"Emergency session ended at {datetime.now().isoformat()} with status: {kwargs.get('status')}"
            
            # Create task for storing the system message
            asyncio.create_task(
                store_session_transcript(
                    session_id=current_session_id,
                    speaker_type="SYSTEM",
                    content=system_message
                )
            )
            logger.info(f"Created task to store end marker for session {current_session_id}")
        
        return result
    
    # Replace the original function with our wrapper
    fnc_ctx.update_session_status = update_session_status_wrapper
    
    agent.start(ctx.room, participant)

    # The agent should be polite and greet the user when it joins :)
    await agent.say("Hello, what is your emergency? I'm ready to help you.", allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm
        ),
    )
