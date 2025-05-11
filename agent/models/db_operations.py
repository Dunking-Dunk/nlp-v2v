import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

class InterviewStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    PENDING_REVIEW = "PENDING_REVIEW"

class JobLevel(str, Enum):
    ENTRY = "ENTRY"
    MID = "MID"
    SENIOR = "SENIOR"
    LEAD = "LEAD"
    MANAGER = "MANAGER"
    EXECUTIVE = "EXECUTIVE"

class DepartmentType(str, Enum):
    ENGINEERING = "ENGINEERING"
    PRODUCT = "PRODUCT"
    DESIGN = "DESIGN"
    MARKETING = "MARKETING"
    SALES = "SALES"
    SUPPORT = "SUPPORT"
    HR = "HR"
    FINANCE = "FINANCE"
    OPERATIONS = "OPERATIONS"

class SpeakerType(str, Enum):
    AGENT = "AGENT"
    CANDIDATE = "CANDIDATE"
    SYSTEM = "SYSTEM"

class CandidateInput(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    resume: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None

class InterviewInput(BaseModel):
    candidateId: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    level: Optional[JobLevel] = Field(default=JobLevel.ENTRY)
    description: Optional[str] = None
    feedback: Optional[str] = None
    overallScore: Optional[int] = Field(default=0, ge=0, le=100)
    status: Optional[InterviewStatus] = None
    
    # Detailed evaluation parameters
    technicalSkillScore: Optional[int] = Field(default=0, ge=0, le=100, description="Score for technical skills and knowledge")
    problemSolvingScore: Optional[int] = Field(default=0, ge=0, le=100, description="Score for problem-solving abilities")
    communicationScore: Optional[int] = Field(default=0, ge=0, le=100, description="Score for communication skills")
    attitudeScore: Optional[int] = Field(default=0, ge=0, le=100, description="Score for attitude and cultural fit")
    experienceRelevanceScore: Optional[int] = Field(default=0, ge=0, le=100, description="Score for relevance of past experience")
    
    # Detailed evaluation text fields
    strengthsNotes: Optional[str] = Field(default=None, description="Notes about candidate's key strengths")
    improvementAreasNotes: Optional[str] = Field(default=None, description="Notes about areas for improvement")
    technicalFeedback: Optional[str] = Field(default=None, description="Detailed feedback on technical aspects")
    culturalFitNotes: Optional[str] = Field(default=None, description="Assessment of cultural fit")
    recommendationNotes: Optional[str] = Field(default=None, description="Recommendations for next steps")

class InterviewTranscriptInput(BaseModel):
    interviewId: str
    speakerType: SpeakerType
    content: str
    timestamp: Optional[datetime.datetime] = None

class UserInput(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    isAdmin: bool = False
    isVerified: bool = False
    resetPasswordToken: Optional[str] = None
    resetPasswordExpires: Optional[datetime.datetime] = None

