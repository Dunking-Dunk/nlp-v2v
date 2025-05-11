import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all interviews with optional filtering
 */
export const getAllInterviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, candidateId } = req.query;

        const filters: any = {};

        // Add filters if provided
        if (status) {
            filters.status = status;
        }

        if (candidateId) {
            filters.candidateId = candidateId;
        }

        const interviews = await prisma.interview.findMany({
            where: filters,
            include: {
                candidate: true,
                transcriptEntries: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            }
        });

        res.status(200).json(interviews);
    } catch (error) {
        console.error('Get interviews error:', error);
        res.status(500).json({ message: 'Failed to get interviews' });
    }
};

/**
 * Get a single interview by ID
 */
export const getInterviewById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const interview = await prisma.interview.findUnique({
            where: { id },
            include: {
                candidate: true,
                transcriptEntries: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        });

        if (!interview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }

        res.status(200).json(interview);
    } catch (error) {
        console.error('Get interview error:', error);
        res.status(500).json({ message: 'Failed to get interview' });
    }
};

/**
 * Create a new interview
 */
export const createInterview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { candidateId, position, department, level, description } = req.body;

        // Validate required fields
        if (!position || !department) {
            res.status(400).json({ message: 'Position and department are required' });
            return;
        }

        // Create interview
        const interview = await prisma.interview.create({
            data: {
                candidateId,
                position,
                department,
                level: level || 'ENTRY',
                description,
                status: 'ACTIVE'
            },
            include: {
                candidate: true
            }
        });

        res.status(201).json(interview);
    } catch (error) {
        console.error('Create interview error:', error);
        res.status(500).json({ message: 'Failed to create interview' });
    }
};

/**
 * Update an existing interview
 */
export const updateInterview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            status,
            endTime,
            feedback,
            overallScore,
            technicalSkillScore,
            problemSolvingScore,
            communicationScore,
            attitudeScore,
            experienceRelevanceScore,
            strengthsNotes,
            improvementAreasNotes,
            technicalFeedback,
            culturalFitNotes,
            recommendationNotes
        } = req.body;

        // Check if interview exists
        const existingInterview = await prisma.interview.findUnique({
            where: { id }
        });

        if (!existingInterview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }

        // Update interview
        const updatedInterview = await prisma.interview.update({
            where: { id },
            data: {
                status: status || undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                feedback: feedback || undefined,
                overallScore: overallScore || undefined,
                technicalSkillScore: technicalSkillScore || undefined,
                problemSolvingScore: problemSolvingScore || undefined,
                communicationScore: communicationScore || undefined,
                attitudeScore: attitudeScore || undefined,
                experienceRelevanceScore: experienceRelevanceScore || undefined,
                strengthsNotes: strengthsNotes || undefined,
                improvementAreasNotes: improvementAreasNotes || undefined,
                technicalFeedback: technicalFeedback || undefined,
                culturalFitNotes: culturalFitNotes || undefined,
                recommendationNotes: recommendationNotes || undefined
            }
        });

        res.status(200).json(updatedInterview);
    } catch (error) {
        console.error('Update interview error:', error);
        res.status(500).json({ message: 'Failed to update interview' });
    }
};

/**
 * Delete an interview
 */
export const deleteInterview = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if interview exists
        const existingInterview = await prisma.interview.findUnique({
            where: { id }
        });

        if (!existingInterview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }

        // First delete all related transcript entries
        await prisma.interviewTranscript.deleteMany({
            where: { interviewId: id }
        });

        // Then delete the interview
        await prisma.interview.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Interview deleted successfully' });
    } catch (error) {
        console.error('Delete interview error:', error);
        res.status(500).json({ message: 'Failed to delete interview' });
    }
};

/**
 * Add a transcript entry to an interview
 */
export const addTranscriptEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { speakerType, content } = req.body;

        // Validate required fields
        if (!speakerType || !content) {
            res.status(400).json({ message: 'Speaker type and content are required' });
            return;
        }

        // Check if interview exists
        const existingInterview = await prisma.interview.findUnique({
            where: { id }
        });

        if (!existingInterview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }

        // Add transcript entry
        const transcriptEntry = await prisma.interviewTranscript.create({
            data: {
                interviewId: id,
                speakerType,
                content
            }
        });

        res.status(201).json(transcriptEntry);
    } catch (error) {
        console.error('Add transcript entry error:', error);
        res.status(500).json({ message: 'Failed to add transcript entry' });
    }
}; 