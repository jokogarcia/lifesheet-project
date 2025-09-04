import StripeRouter from './stripe';
import { Router } from 'express';
const router = Router();
router.use('/stripe', StripeRouter);
export default router;
