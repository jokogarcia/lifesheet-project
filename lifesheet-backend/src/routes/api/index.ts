import { Router } from 'express';
import UserRouter from './user/user.routes';
import { SaaSPlan } from '../../models/saaS-plan.model';
import UtilsRouter from './utils';
import {constants} from '../../constants';
const router = Router();

router.use('/user', UserRouter);
//router.use('/saas', SaaSRouter);
// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});
router.get('/saas/plans', async (req, res) => {
  try {
    const plans = await SaaSPlan.find({
      deletedAt: null
    });
    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching SaaS plans:', error);
    res.status(500).json({ message: 'Failed to fetch SaaS plans' });
  }
});
router.get('/saas/stripepk', (req, res) => {
  res.status(200).json({ pk: constants.STRIPE_PK });
});
router.use('/utils', UtilsRouter);
router.all('/{*any}', (req, res) => {
  res.status(404).json({ status: 'error', message: 'API endpoint not found' });
});
export default router;