import express from 'express';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

import { jwtCheck, extractUserFromToken } from '../../../middleware/auth.middleware';
import {
  getUserProfile,
  updateUserProfile,
  getUserCV,
  upsertUserTailoredCV,
  deleteUserCV,
  getUserTailoredCV,
  tailorCV,
  updateUsersCV,
  renderCVAsPDF,
  uploadPicture,
  getUserPicture,
  deleteUserPicture,
  getUserPictures,
  initiatePlanPurchase,
  getUsersActiveSubscription,
  getAllUsersSubscriptions,
  getUsersSubscriptionStatus,
  getUserPictureShareLink,
  getUsersTailoredCvs,
  checkTailoringStatus,
  resetUsersAccount,
  deleteUsersAccount,
} from '../../../controllers/user.controller';
const router = express.Router();
router.use([jwtCheck, extractUserFromToken]);
router.get('/:id/', getUserProfile);
router.put('/:id/', updateUserProfile);
router.get('/:id/cv', getUserCV);
router.get('/:id/cv/tailored-list', getUsersTailoredCvs);
router.put('/:id/cv/:cvId', updateUsersCV);
router.get('/:id/cv/:cvId', getUserTailoredCV);
router.get('/:id/cv/:cvId/pdf', renderCVAsPDF);
router.post('/:id/cv/tailor', tailorCV);
router.get('/:id/cv/tailor/progress/:bullId', checkTailoringStatus);
router.post('/:id/cv/:cvId', upsertUserTailoredCV);

router.delete('/:id/cv/:cvId', deleteUserCV);

router.post('/:id/picture', upload.single('picture'), uploadPicture);
router.get('/:id/pictures', getUserPictures);
router.get('/:id/picture/:pictureId', getUserPicture);
router.delete('/:id/picture/:pictureId', deleteUserPicture);
router.get('/:id/picture/:pictureId/share-link', getUserPictureShareLink);

router.get('/:id/saas/subscriptions', getAllUsersSubscriptions);
router.get('/:id/saas/subscriptions/active', getUsersActiveSubscription);
router.post('/:id/saas/subscriptions', initiatePlanPurchase);

router.get('/:id/saas/subscriptions/:subscriptionId/status', getUsersSubscriptionStatus);
router.post('/:id/reset', resetUsersAccount);
router.delete('/:id', deleteUsersAccount);

export default router;
