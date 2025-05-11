import logging
from typing import Optional, Dict, Any
import datetime
import asyncio

from .db_operations import (
    create_candidate,
    create_interview,
    create_interview_transcript,
    update_interview,
    update_candidate,
    get_candidate_by_email,
    get_candidate_by_phone,
    get_interview_by_id,
    get_interview_transcripts
)

from models.db_operations import InterviewInput, CandidateInput, InterviewTranscriptInput, InterviewStatus, SpeakerType

# Import socket client for real-time updates
from .socket_client import send_transcript_update, send_evaluation_update, join_interview_room

logger = logging.getLogger("db-tools")

async def create_or_update_interview(
    interview_id: Optional[str] = None,
    position: Optional[str] = None,
    department: Optional[str] = None,
    level: Optional[str] = None,
    description: Optional[str] = None,
    candidate_name: Optional[str] = None,
    candidate_email: Optional[str] = None,
    candidate_phone: Optional[str] = None,
    candidate_experience: Optional[str] = None,
    candidate_education: Optional[str] = None,
    candidate_skills: Optional[str] = None,
    candidate_resume: Optional[str] = None,
    feedback: Optional[str] = None,
    overall_score: Optional[int] = None,
    status: Optional[InterviewStatus] = None
) -> Dict[str, Any]:
    """
    Create or update an interview session with all possible details.
    This is the main entry point for managing interview sessions.
    
    Args:
        interview_id: ID of existing interview to update (optional)
        position: Job position being interviewed for
        department: Department of the position
        level: Job level (ENTRY, MID, SENIOR, LEAD, MANAGER, EXECUTIVE)
        description: Description of the position or interview
        candidate_name: Name of the candidate
        candidate_email: Email of the candidate
        candidate_phone: Phone number of the candidate
        candidate_experience: Work experience of the candidate
        candidate_education: Education details of the candidate
        candidate_skills: Skills of the candidate
        candidate_resume: Resume text of the candidate
        feedback: Interview feedback
        overall_score: Overall interview score (0-100)
        status: Interview status
        
    Returns:
        Dictionary with created/updated interview details including candidate information
    """
    try:
        candidate_id = None
        
        # First check if candidate exists by email or phone
        existing_candidate = None
        if candidate_email:
            existing_candidate = await get_candidate_by_email(candidate_email)
        
        if not existing_candidate and candidate_phone:
            existing_candidate = await get_candidate_by_phone(candidate_phone)
            
        if existing_candidate:
            candidate_id = existing_candidate.id
            
            # Update candidate with any new information
            candidate_update_data = {}
            if candidate_name and not existing_candidate.name:
                candidate_update_data["name"] = candidate_name
            if candidate_resume and not existing_candidate.resume:
                candidate_update_data["resume"] = candidate_resume
            if candidate_experience and not existing_candidate.experience:
                candidate_update_data["experience"] = candidate_experience
            if candidate_education and not existing_candidate.education:
                candidate_update_data["education"] = candidate_education
            if candidate_skills and not existing_candidate.skills:
                candidate_update_data["skills"] = candidate_skills
                
            if candidate_update_data:
                await update_candidate(candidate_id, candidate_update_data)
                logger.info(f"Updated candidate with ID: {candidate_id}")
        else:
            # Create new candidate
            if any([candidate_name, candidate_email, candidate_phone, candidate_experience, 
                   candidate_education, candidate_skills, candidate_resume]):
                candidate_data = CandidateInput(
                    name=candidate_name,
                    email=candidate_email,
                    phone=candidate_phone,
                    experience=candidate_experience,
                    education=candidate_education,
                    skills=candidate_skills,
                    resume=candidate_resume
                )
                candidate = await create_candidate(candidate_data)
                if candidate:
                    candidate_id = candidate.id
                    logger.info(f"Created candidate with ID: {candidate_id}")
        
        # Prepare interview data
        interview_data = InterviewInput(
            candidateId=candidate_id,
            position=position,
            department=department,
            level=level,
            description=description,
            feedback=feedback,
            overallScore=overall_score,
            status=status
        )
        
        if interview_id:
            # Update existing interview
            interview = await update_interview(interview_id, interview_data.dict(exclude_none=True))
            if not interview:
                logger.error(f"Failed to update interview {interview_id}")
                return {"success": False, "error": "Failed to update interview session"}
            logger.info(f"Updated interview with ID: {interview_id}")
        else:
            # Create new interview
            interview = await create_interview(interview_data)
            if not interview:
                logger.error("Failed to create interview")
                return {"success": False, "error": "Failed to create interview session"}
            logger.info(f"Created interview with ID: {interview.id}")
            interview_id = interview.id
        
        return {
            "success": True,
            "interview_id": interview_id,
            "candidate_id": candidate_id,
            "position": position,
            "level": level,
            "department": department,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error managing interview session: {str(e)}")
        return {"success": False, "error": str(e)}


async def update_interview_feedback(
    interview_id: str,
    feedback: Optional[str] = None,
    overall_score: Optional[int] = None,
    status: Optional[InterviewStatus] = None,
    # New detailed evaluation parameters
    technical_skill_score: Optional[int] = None,
    problem_solving_score: Optional[int] = None,
    communication_score: Optional[int] = None,
    attitude_score: Optional[int] = None,
    experience_relevance_score: Optional[int] = None,
    strengths_notes: Optional[str] = None,
    improvement_areas_notes: Optional[str] = None,
    technical_feedback: Optional[str] = None,
    cultural_fit_notes: Optional[str] = None,
    recommendation_notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update interview feedback and status with detailed evaluation.
    
    Args:
        interview_id: ID of the interview to update
        feedback: Overall interview feedback text
        overall_score: Overall interview score (0-100)
        status: Interview status
        technical_skill_score: Score for technical skills (0-100)
        problem_solving_score: Score for problem-solving abilities (0-100)
        communication_score: Score for communication skills (0-100)
        attitude_score: Score for attitude and cultural fit (0-100)
        experience_relevance_score: Score for relevance of past experience (0-100)
        strengths_notes: Notes about candidate's key strengths
        improvement_areas_notes: Notes about areas for improvement
        technical_feedback: Detailed feedback on technical aspects
        cultural_fit_notes: Assessment of cultural fit
        recommendation_notes: Recommendations for next steps
        
    Returns:
        Dictionary with updated interview details
    """
    try:
        # Validate interview exists
        interview = await get_interview_by_id(interview_id)
        if not interview:
            logger.error(f"Interview not found: {interview_id}")
            return {"success": False, "error": "Interview not found"}
        
        # Prepare update data
        update_data = {}
        if feedback is not None:
            update_data["feedback"] = feedback
        if overall_score is not None:
            update_data["overallScore"] = overall_score
        if status is not None:
            update_data["status"] = status
            
        # Add detailed evaluation parameters
        if technical_skill_score is not None:
            update_data["technicalSkillScore"] = technical_skill_score
        if problem_solving_score is not None:
            update_data["problemSolvingScore"] = problem_solving_score
        if communication_score is not None:
            update_data["communicationScore"] = communication_score
        if attitude_score is not None:
            update_data["attitudeScore"] = attitude_score
        if experience_relevance_score is not None:
            update_data["experienceRelevanceScore"] = experience_relevance_score
            
        # Add detailed feedback text fields
        if strengths_notes is not None:
            update_data["strengthsNotes"] = strengths_notes
        if improvement_areas_notes is not None:
            update_data["improvementAreasNotes"] = improvement_areas_notes
        if technical_feedback is not None:
            update_data["technicalFeedback"] = technical_feedback
        if cultural_fit_notes is not None:
            update_data["culturalFitNotes"] = cultural_fit_notes
        if recommendation_notes is not None:
            update_data["recommendationNotes"] = recommendation_notes
            
        # Update interview
        updated_interview = await update_interview(interview_id, update_data)
        if not updated_interview:
            logger.error(f"Failed to update interview feedback: {interview_id}")
            return {"success": False, "error": "Failed to update interview feedback"}
        
        # Send real-time evaluation update
        asyncio.create_task(send_evaluation_update(interview_id, update_data))
            
        return {
            "success": True,
            "interview_id": interview_id,
            "status": updated_interview.status,
            "overall_score": updated_interview.overallScore,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating interview feedback: {str(e)}")
        return {"success": False, "error": str(e)}


async def store_interview_transcript(interview_id: str, speaker_type: str, content: str):
    """
    Store a new interview transcript entry in the database and send real-time update.
    
    Args:
        interview_id: ID of the interview
        speaker_type: Type of speaker (AGENT, CANDIDATE, SYSTEM)
        content: Content of the message
    
    Returns:
        The created transcript entry
    """
    try:
        # Create transcript data
        interview_transcript_data = InterviewTranscriptInput(
            interviewId=interview_id,
            speakerType=speaker_type,
            content=content
        )
        
        # Store in database
        result = await create_interview_transcript(interview_transcript_data)
        if not result:
            logger.error(f"Failed to create transcript entry for interview {interview_id}")
            return None
            
        logger.info(f"Created transcript entry for interview {interview_id}")
        
        # Send real-time update via WebSocket
        transcript_data = {
            'speakerType': speaker_type,
            'content': content,
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        # Send update in a non-blocking way
        asyncio.create_task(send_transcript_update(interview_id, transcript_data))
        
        return result
    except Exception as e:
        logger.error(f"Error storing interview transcript: {str(e)}")
        return None
