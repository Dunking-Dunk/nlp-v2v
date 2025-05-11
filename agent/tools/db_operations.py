from typing import Optional, List
from models.db_operations import CandidateInput, InterviewInput, InterviewStatus, InterviewTranscriptInput, UserInput

from utils import execute_db_operation

async def create_candidate(data: CandidateInput):
    """Create a new candidate in the database"""
    async def operation(client, data):
        return await client.candidate.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_interview(data: InterviewInput):
    """Create a new interview in the database"""
    async def operation(client, data):
        return await client.interview.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_interview_transcript(data: InterviewTranscriptInput):
    """Create a new interview transcript entry in the database"""
    async def operation(client, data):
        return await client.interviewtranscript.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def create_user(data: UserInput):
    """Create a new user in the database"""
    async def operation(client, data):
        return await client.user.create(data=data.dict(exclude_none=True))
    
    return await execute_db_operation(operation, data)

async def update_interview(interview_id: str, data: dict):
    """Update an existing interview in the database"""
    async def operation(client, interview_id, data):
        return await client.interview.update(
            where={"id": interview_id},
            data=data
        )
    
    return await execute_db_operation(operation, interview_id, data)

async def update_candidate(candidate_id: str, data: dict):
    """Update an existing candidate in the database"""
    async def operation(client, candidate_id, data):
        return await client.candidate.update(
            where={"id": candidate_id},
            data=data
        )
    
    return await execute_db_operation(operation, candidate_id, data)

async def get_user_by_email(email: str):
    """Get a user by email"""
    async def operation(client, email):
        return await client.user.find_unique(where={"email": email})
    
    return await execute_db_operation(operation, email)

async def get_candidate_by_email(email: str):
    """Get a candidate by email"""
    async def operation(client, email):
        return await client.candidate.find_unique(where={"email": email})
    
    return await execute_db_operation(operation, email)

async def get_candidate_by_phone(phone: str):
    """Get a candidate by phone number"""
    async def operation(client, phone):
        return await client.candidate.find_unique(where={"phone": phone})
    
    return await execute_db_operation(operation, phone)

async def get_interview_by_id(interview_id: str):
    """Get an interview by ID"""
    async def operation(client, interview_id):
        return await client.interview.find_unique(where={"id": interview_id})
    
    return await execute_db_operation(operation, interview_id)

async def get_interview_transcripts(interview_id: str):
    """Get all transcript entries for an interview"""
    async def operation(client, interview_id):
        return await client.interviewtranscript.find_many(
            where={"interviewId": interview_id},
            order_by={"timestamp": "asc"}
        )
    
    return await execute_db_operation(operation, interview_id)
