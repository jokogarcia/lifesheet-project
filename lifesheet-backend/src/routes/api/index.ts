import { Router } from 'express';
import UserRouter from './user/user.routes';
import { SaaSPlan } from '../../models/saaS-plan.model';
import UtilsRouter from './utils';
import { constants } from '../../constants';
import { translate } from '../../services/translate-service';
const router = Router();

router.use('/user', UserRouter);
//router.use('/saas', SaaSRouter);
// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});
router.get('/saas/plans', async (req, res) => {
  let { language } = req.query;
  language = (language as string)?.toLowerCase() || 'en';
  if (!['en', 'es', 'de'].includes(language)) {
    res.status(400).json({ message: 'Unsupported language' });
    return;
  }
  try {
    const plans = await SaaSPlan.find({
      deletedAt: null,
    });
    if (language !== 'en') {
      await Promise.all(
        plans.map(async plan => {
          plan.description = await translate(plan.description, language as string);
          plan.features = await Promise.all(
            plan.features.map(f => translate(f, language as string))
          );
        })
      );
    }
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
