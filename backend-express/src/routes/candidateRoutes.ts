import express from 'express';
import {
    getAllCandidates,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate
} from '../controllers/candidateController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All candidate routes are protected
router.use(protect);

// Candidate CRUD operations
router.route('/')
    .get(getAllCandidates)
    .post(createCandidate);

router.route('/:id')
    .get(getCandidateById)
    .put(updateCandidate)
    .delete(deleteCandidate);

export default router; 