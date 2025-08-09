import express from 'express';

import { jwtCheck, extractUserFromToken } from '../middleware/auth0.middleware';
import { getUserProfile, updateUserProfile, deleteUserProfile, getUserCV, upsertUserTailoredCV, deleteUserCV, getUserTailoredCV, tailorCV, updateUsersMainCV } from '../controllers/user.controller';
import { get } from 'mongoose';
const router = express.Router();
router.use([jwtCheck, extractUserFromToken]);
router.get('/:id/',getUserProfile);
router.put('/:id/', updateUserProfile);
router.delete('/:id', deleteUserProfile);
router.get('/:id/cv', getUserCV);
router.put('/:id/cv', updateUsersMainCV)
router.get('/:id/cv/:cvId', getUserTailoredCV);
router.post('/:id/cv/:cvId', upsertUserTailoredCV);
router.delete('/:id/cv/:cvId', deleteUserCV);
router.post('/:id/cv/tailor', tailorCV);
export default router;