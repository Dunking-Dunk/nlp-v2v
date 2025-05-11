export type User = {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum InterviewStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PENDING_REVIEW = "PENDING_REVIEW"
}

export enum JobLevel {
  ENTRY = "ENTRY",
  MID = "MID",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
  MANAGER = "MANAGER",
  EXECUTIVE = "EXECUTIVE"
}

export enum SpeakerType {
  AGENT = "AGENT",
  CANDIDATE = "CANDIDATE",
  SYSTEM = "SYSTEM"
}

export type Candidate = {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  resume?: string;
  experience?: string;
  skills?: string;
  education?: string;
  interviews?: Interview[];
  createdAt: string;
  updatedAt: string;
}

export type Interview = {
  id: string;
  startTime: string;
  endTime?: string;
  status: InterviewStatus;
  candidateId?: string;
  candidate?: Candidate;
  position?: string;
  department?: string;
  level?: string;
  description?: string;
  feedback?: string;
  overallScore?: number;
  technicalSkillScore?: number;
  problemSolvingScore?: number;
  communicationScore?: number;
  attitudeScore?: number;
  experienceRelevanceScore?: number;
  strengthsNotes?: string;
  improvementAreasNotes?: string;
  technicalFeedback?: string;
  culturalFitNotes?: string;
  recommendationNotes?: string;
  transcriptEntries?: InterviewTranscript[];
  createdAt: string;
  updatedAt: string;
}

export type InterviewTranscript = {
  id: string;
  interviewId: string;
  timestamp: string;
  speakerType: SpeakerType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface CreateInterviewRequest {
  candidateId?: string;
  position: string;
  department: string;
  level?: string;
  description?: string;
}

export interface UpdateInterviewRequest {
  status?: InterviewStatus;
  endTime?: string;
  feedback?: string;
  overallScore?: number;
  technicalSkillScore?: number;
  problemSolvingScore?: number;
  communicationScore?: number;
  attitudeScore?: number;
  experienceRelevanceScore?: number;
  strengthsNotes?: string;
  improvementAreasNotes?: string;
  technicalFeedback?: string;
  culturalFitNotes?: string;
  recommendationNotes?: string;
}

export interface CreateTranscriptRequest {
  speakerType: SpeakerType;
  content: string;
}

export interface CreateCandidateRequest {
  email?: string;
  phone?: string;
  name?: string;
  resume?: string;
  experience?: string;
  skills?: string;
  education?: string;
}

export interface ApiResponse<T> {
  status: number;
  data: string;
  user?: User;
  token?: string;
  needsVerification?: boolean;
  [key: string]: any;
}
