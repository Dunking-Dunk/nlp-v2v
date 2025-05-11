import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all candidates with optional filtering
 */
export const getAllCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email } = req.query;

        const filters: any = {};

        // Add filters if provided
        if (name) {
            filters.name = {
                contains: name,
                mode: 'insensitive',
            };
        }

        if (email) {
            filters.email = {
                contains: email,
                mode: 'insensitive',
            };
        }

        const candidates = await prisma.candidate.findMany({
            where: filters,
            include: {
                interviews: {
                    select: {
                        id: true,
                        status: true,
                        startTime: true,
                        position: true,
                        department: true,
                    },
                    orderBy: {
                        startTime: 'desc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.status(200).json(candidates);
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ message: 'Failed to get candidates' });
    }
};

/**
 * Get a single candidate by ID
 */
export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const candidate = await prisma.candidate.findUnique({
            where: { id },
            include: {
                interviews: {
                    orderBy: {
                        startTime: 'desc',
                    },
                },
            },
        });

        if (!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        res.status(200).json(candidate);
    } catch (error) {
        console.error('Get candidate error:', error);
        res.status(500).json({ message: 'Failed to get candidate' });
    }
};

/**
 * Create a new candidate
 */
export const createCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, phone, name, resume, experience, skills, education } = req.body;

        // Validate required fields
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        // Check if candidate with same email already exists
        if (email) {
            const existingCandidate = await prisma.candidate.findUnique({
                where: { email },
            });

            if (existingCandidate) {
                res.status(400).json({ message: 'Candidate with this email already exists' });
                return;
            }
        }

        // Create candidate
        const candidate = await prisma.candidate.create({
            data: {
                email,
                phone,
                name,
                resume,
                experience,
                skills,
                education,
            },
        });

        res.status(201).json(candidate);
    } catch (error) {
        console.error('Create candidate error:', error);
        res.status(500).json({ message: 'Failed to create candidate' });
    }
};

/**
 * Update an existing candidate
 */
export const updateCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, phone, name, resume, experience, skills, education } = req.body;

        // Check if candidate exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { id },
        });

        if (!existingCandidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        // Check if email is being changed and already exists for another candidate
        if (email && email !== existingCandidate.email) {
            const emailExists = await prisma.candidate.findUnique({
                where: { email },
            });

            if (emailExists) {
                res.status(400).json({ message: 'Email is already in use by another candidate' });
                return;
            }
        }

        // Update candidate
        const updatedCandidate = await prisma.candidate.update({
            where: { id },
            data: {
                email: email || undefined,
                phone: phone || undefined,
                name: name || undefined,
                resume: resume || undefined,
                experience: experience || undefined,
                skills: skills || undefined,
                education: education || undefined,
            },
        });

        res.status(200).json(updatedCandidate);
    } catch (error) {
        console.error('Update candidate error:', error);
        res.status(500).json({ message: 'Failed to update candidate' });
    }
};

/**
 * Delete a candidate
 */
export const deleteCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if candidate exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { id },
        });

        if (!existingCandidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        // Delete candidate
        await prisma.candidate.delete({
            where: { id },
        });

        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        console.error('Delete candidate error:', error);
        res.status(500).json({ message: 'Failed to delete candidate' });
    }
}; 