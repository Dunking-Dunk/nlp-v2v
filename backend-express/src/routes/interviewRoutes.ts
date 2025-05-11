import express from 'express';
import {
    getAllInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview,
    addTranscriptEntry
} from '../controllers/interviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All interview routes are protected
router.use(protect);

// Interview CRUD operations
router.route('/')
    .get(getAllInterviews)
    .post(createInterview);

router.route('/:id')
    .get(getInterviewById)
    .put(updateInterview)
    .delete(deleteInterview);

// Interview transcript operations
router.post('/:id/transcript', addTranscriptEntry);

export default router; 