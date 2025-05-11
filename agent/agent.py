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
    create_or_update_interview,
    update_interview_feedback,
    store_interview_transcript
)
from utils import ai_prompt, execute_db_operation

# Import WebSocket connection functions
from tools.socket_client import connect_socket, join_interview_room, disconnect_socket

load_dotenv(dotenv_path=".env.local")
logger = logging.getLogger("voice-agent")


# Function to create an initial interview when a connection is established
async def initialize_interview():
    """
    Create an initial empty interview when a connection is established.
    This allows for immediate transcript recording.
    
    Returns:
        The interview ID if successful, None otherwise
    """
    try:
        # First connect to the WebSocket server for real-time updates
        await connect_socket()
        
        result = await create_or_update_interview(
            position="Software Engineer",
            department="ENGINEERING",
            description="Initial interview - details pending"
        )
        
        if result and "success" in result and result["success"] and "interview_id" in result:
            interview_id = result["interview_id"]
            logger.info(f"Created initial interview with ID: {interview_id}")
            
            # Add a system message to mark the start of the interview
            system_message = f"Technical interview initialized at {datetime.now().isoformat()}"
            await store_interview_transcript(
                interview_id=interview_id,
                speaker_type="SYSTEM",
                content=system_message
            )
            
            # Join the interview room for real-time updates
            await join_interview_room(interview_id)
            logger.info(f"Joined WebSocket room for interview: {interview_id}")
            
            return interview_id
        else:
            logger.error("Failed to create initial interview")
            return None
    except Exception as e:
        logger.error(f"Error initializing interview: {str(e)}")
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
    
    # Initialize an interview as soon as the participant joins
    current_interview_id = await initialize_interview()
    logger.info(f"Initialized interview for participant {participant.identity}: {current_interview_id}")
    
    class TechnicalInterviewFnc(llm.FunctionContext):
        @llm.ai_callable()
        async def create_interview_session(
            self,
            position: Annotated[
                Optional[str], llm.TypeInfo(description="Job position title being interviewed for")
            ] = None,
            department: Annotated[
                Optional[str], llm.TypeInfo(description="Department name (ENGINEERING, PRODUCT, etc.)")
            ] = None,
            level: Annotated[
                Optional[str], llm.TypeInfo(description="Job level (ENTRY, MID, SENIOR, LEAD, MANAGER, EXECUTIVE)")
            ] = None,
            description: Annotated[
                Optional[str], llm.TypeInfo(description="Job description or interview notes")
            ] = None,
            candidate_name: Annotated[
                Optional[str], llm.TypeInfo(description="Name of the candidate")
            ] = None,
            candidate_email: Annotated[
                Optional[str], llm.TypeInfo(description="Email of the candidate")
            ] = None,
            candidate_phone: Annotated[
                Optional[str], llm.TypeInfo(description="Phone number of the candidate")
            ] = None,
            candidate_experience: Annotated[
                Optional[str], llm.TypeInfo(description="Years and details of work experience")
            ] = None,
            candidate_education: Annotated[
                Optional[str], llm.TypeInfo(description="Educational background details")
            ] = None,
            candidate_skills: Annotated[
                Optional[str], llm.TypeInfo(description="Key skills of the candidate")
            ] = None,
            candidate_resume: Annotated[
                Optional[str], llm.TypeInfo(description="Text from candidate's resume")
            ] = None,
            status: Annotated[
                Optional[str], llm.TypeInfo(description="Interview status (ACTIVE, COMPLETED, CANCELLED, PENDING_REVIEW)")
            ] = None
        ):
            """Called to create or update an interview session with all relevant details. Use this when you've gathered candidate information."""
            nonlocal current_interview_id
            
            # If we have a current interview, update it
            if current_interview_id:
                logger.info(f"Interview already exists ({current_interview_id}), updating with new information")
                result = await create_or_update_interview(
                    interview_id=current_interview_id,
                    position=position,
                    department=department,
                    level=level,
                    description=description,
                    candidate_name=candidate_name,
                    candidate_email=candidate_email,
                    candidate_phone=candidate_phone,
                    candidate_experience=candidate_experience,
                    candidate_education=candidate_education,
                    candidate_skills=candidate_skills,
                    candidate_resume=candidate_resume,
                    status=status
                )
                
                if result and result.get("success"):
                    # Add system message about enhancing the interview with details
                    system_message = f"Enhanced interview with additional details at {datetime.now().isoformat()}"
                    asyncio.create_task(
                        store_interview_transcript(
                            interview_id=current_interview_id,
                            speaker_type="SYSTEM",
                            content=system_message
                        )
                    )
                    return result
                else:
                    # If update failed, try to create a new interview
                    logger.warning(f"Failed to update interview {current_interview_id}, creating new one")
                    current_interview_id = None
            
            if not current_interview_id:
                result = await create_or_update_interview(
                    position=position,
                    department=department,
                    level=level,
                    description=description,
                    candidate_name=candidate_name,
                    candidate_email=candidate_email,
                    candidate_phone=candidate_phone,
                    candidate_experience=candidate_experience,
                    candidate_education=candidate_education,
                    candidate_skills=candidate_skills,
                    candidate_resume=candidate_resume,
                    status=status
                )
                
                if result and "success" in result and result["success"] and "interview_id" in result:
                    current_interview_id = result["interview_id"]
                    logger.info(f"Created new interview with ID: {current_interview_id}")
                
                return result
            return {"success": False, "error": "Unknown error in interview handling"}
        
        @llm.ai_callable()
        async def update_feedback(
            self,
            interview_id: Annotated[
                Optional[str], llm.TypeInfo(description="ID of the interview")
            ] = None,
            feedback: Annotated[
                Optional[str], llm.TypeInfo(description="Overall feedback on candidate performance")
            ] = None,
            overall_score: Annotated[
                Optional[int], llm.TypeInfo(description="Overall interview score (0-100)")
            ] = None,
            status: Annotated[
                Optional[str], llm.TypeInfo(description="Interview status (ACTIVE, COMPLETED, CANCELLED, PENDING_REVIEW)")
            ] = None,
            # Detailed evaluation parameters
            technical_skill_score: Annotated[
                Optional[int], llm.TypeInfo(description="Score for technical skills and knowledge (0-100)")
            ] = None,
            problem_solving_score: Annotated[
                Optional[int], llm.TypeInfo(description="Score for problem-solving abilities (0-100)")
            ] = None,
            communication_score: Annotated[
                Optional[int], llm.TypeInfo(description="Score for communication skills (0-100)")
            ] = None,
            attitude_score: Annotated[
                Optional[int], llm.TypeInfo(description="Score for attitude and cultural fit (0-100)")
            ] = None,
            experience_relevance_score: Annotated[
                Optional[int], llm.TypeInfo(description="Score for relevance of past experience (0-100)")
            ] = None,
            strengths_notes: Annotated[
                Optional[str], llm.TypeInfo(description="Notes about candidate's key strengths")
            ] = None,
            improvement_areas_notes: Annotated[
                Optional[str], llm.TypeInfo(description="Notes about areas for improvement")
            ] = None,
            technical_feedback: Annotated[
                Optional[str], llm.TypeInfo(description="Detailed feedback on technical aspects")
            ] = None,
            cultural_fit_notes: Annotated[
                Optional[str], llm.TypeInfo(description="Assessment of cultural fit")
            ] = None,
            recommendation_notes: Annotated[
                Optional[str], llm.TypeInfo(description="Recommendations for next steps")
            ] = None
        ):
            """Called to update interview feedback and status with detailed evaluation as the interview progresses or concludes."""
            nonlocal current_interview_id
            
            # If interview_id not provided, use the current interview
            if not interview_id and current_interview_id:
                interview_id = current_interview_id
                logger.info(f"Using current interview ID: {interview_id} for feedback update")
            
            result = await update_interview_feedback(
                interview_id=interview_id,
                feedback=feedback,
                overall_score=overall_score,
                status=status,
                technical_skill_score=technical_skill_score,
                problem_solving_score=problem_solving_score,
                communication_score=communication_score,
                attitude_score=attitude_score,
                experience_relevance_score=experience_relevance_score,
                strengths_notes=strengths_notes,
                improvement_areas_notes=improvement_areas_notes,
                technical_feedback=technical_feedback,
                cultural_fit_notes=cultural_fit_notes,
                recommendation_notes=recommendation_notes
            )
            
            # If the status indicates the interview is ending, close the room after a delay
            if result and result.get("success") and status in ["COMPLETED", "CANCELLED"]:
                system_message = f"Interview marked as {status} at {datetime.now().isoformat()}"
                await store_interview_transcript(
                    interview_id=interview_id,
                    speaker_type="SYSTEM", 
                    content=system_message
                )
                
                # Schedule room closing
                asyncio.create_task(self.end_interview_session(status))
            
            return result
        
        @llm.ai_callable()
        async def end_interview_session(
            self,
            status: Annotated[
                str, llm.TypeInfo(description="Final status of the interview (COMPLETED, CANCELLED)")
            ]
        ):
            """End the interview session and close the room after giving final feedback. Call this when the interview is complete."""
            nonlocal current_interview_id, agent
            
            if not current_interview_id:
                return {"success": False, "error": "No active interview session"}
                
            # Say goodbye and inform about disconnection
            goodbye_message = f"Thank you for participating in this interview. The session has been marked as {status}. "
            
            if status == "COMPLETED":
                goodbye_message += "Your interview has been recorded and will be reviewed by the hiring team. You will be notified about next steps soon."
            elif status == "CANCELLED":
                goodbye_message += "If you wish to reschedule, please contact our HR department."
            
            goodbye_message += " The session will end in 10 seconds. Goodbye!"
            
            # Say goodbye
            await agent.say(goodbye_message, allow_interruptions=False)
            
            # Record final system message
            await store_interview_transcript(
                interview_id=current_interview_id,
                speaker_type="SYSTEM",
                content=f"Interview session ended by agent with status: {status}"
            )
            
            # Wait a moment to ensure message is heard
            await asyncio.sleep(10)
            
            # Disconnect from the WebSocket
            await disconnect_socket()
            logger.info("Disconnected from WebSocket server")
            
            # Removed room disconnection
            logger.info(f"Interview completed with status: {status}")
            
            return {
                "success": True,
                "interview_id": current_interview_id,
                "status": status,
                "message": "Interview session ended successfully"
            }

    # Create the function context instance
    fnc_ctx = TechnicalInterviewFnc()

    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=google.LLM(model="gemini-2.0-flash"),
        tts=google.TTS(),
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

    @agent.on("user_speech_committed")
    def on_user_speech_committed(msg=None):
        try:
            if msg and current_interview_id:
                # Extract text content from the message
                content = msg.content if hasattr(msg, 'content') else (msg.text if hasattr(msg, 'text') else str(msg))
                
                # Store candidate's speech in transcript
                asyncio.create_task(
                    store_interview_transcript(
                        interview_id=current_interview_id,
                        speaker_type="CANDIDATE",
                        content=content
                    )
                )
                logger.info(f"Stored candidate transcript: {content[:30]}...")
            else:
                logger.warning("Cannot store candidate transcript: No message or interview ID")
        except Exception as e:
            logger.error(f"Error storing candidate transcript: {e}")

    @agent.on("agent_speech_committed")
    def on_agent_speech_committed(msg=None):
        try:
            if msg and current_interview_id:
                # Extract text content from the message
                content = msg.content if hasattr(msg, 'content') else (msg.text if hasattr(msg, 'text') else str(msg))
                
                # Store agent's speech in transcript
                asyncio.create_task(
                    store_interview_transcript(
                        interview_id=current_interview_id,
                        speaker_type="AGENT",
                        content=content
                    )
                )
                logger.info(f"Stored agent transcript: {content[:30]}...")
            else:
                logger.warning("Cannot store agent transcript: No message or interview ID")
        except Exception as e:
            logger.error(f"Error storing agent transcript: {e}")

    agent.start(ctx.room, participant)

    # Greet the candidate when agent joins
    await agent.say("Hello, I'm your technical interviewer from Zoho. Thank you for joining this interview session. Let's start by getting to know a bit about you.", allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm
        ),
    )
