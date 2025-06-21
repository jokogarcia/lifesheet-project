import express from 'express';
import { getMe, updateMe } from '../controllers/auth.controller';
import { jwtCheck, extractUserFromToken } from '../middleware/auth0.middleware';

const router = express.Router();

// Auth0 routes
// These routes are protected by the jwtCheck middleware
router.get('/me', jwtCheck, extractUserFromToken, getMe);
router.put('/me', jwtCheck, extractUserFromToken, updateMe);

export default router;
