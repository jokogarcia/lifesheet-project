import express from 'express';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

import { jwtCheck, extractUserFromToken } from '../middleware/auth0.middleware';
import { getUserProfile, updateUserProfile, deleteUserProfile, getUserCV, upsertUserTailoredCV, deleteUserCV, getUserTailoredCV, tailorCV, updateUsersMainCV, renderCVAsPDF, uploadPicture, getUserPicture, deleteUserPicture, getUserPictures, initiatePlanPurchase, getUsersActiveSubscription, getAllUsersSubscriptions, getUsersSubscriptionStatus } from '../controllers/user.controller';
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


router.post('/:id/picture', upload.single('picture'), uploadPicture);
router.get('/:id/pictures', getUserPictures);
router.get('/:id/picture/:pictureId', getUserPicture);
router.delete('/:id/picture/:pictureId', deleteUserPicture);


router.get("/:id/saas/subscriptions", getAllUsersSubscriptions)
router.get("/:id/saas/subscriptions/active", getUsersActiveSubscription)
router.post("/:id/saas/subscriptions", initiatePlanPurchase)
router.get("/:id/saas/subscriptions/:subscriptionId/status", getUsersSubscriptionStatus)

export default router;
