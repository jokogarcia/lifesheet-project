import express from 'express';

import { jwtCheck, extractUserFromToken } from '../middleware/auth0.middleware';
import { getUserProfile, updateUserProfile, deleteUserProfile, getUserCV, upsertUserTailoredCV, deleteUserCV, getUserTailoredCV, tailorCV, updateUsersMainCV, renderCVAsPDF } from '../controllers/user.controller';
const router = express.Router();
router.use([jwtCheck, extractUserFromToken]);
router.get('/:id/',getUserProfile);
router.put('/:id/', updateUserProfile);
router.delete('/:id', deleteUserProfile);
router.get('/:id/cv', getUserCV);
router.put('/:id/cv', updateUsersMainCV)
router.get('/:id/cv/:cvId', getUserTailoredCV);
router.get('/:id/cv/:cvId/pdf', renderCVAsPDF);
router.post('/:id/cv/tailor', tailorCV);
router.post('/:id/cv/:cvId', upsertUserTailoredCV);
router.delete('/:id/cv/:cvId', deleteUserCV);
export default router;