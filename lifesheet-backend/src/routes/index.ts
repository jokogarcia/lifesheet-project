import ApiRouter from './api';
import {Router} from 'express'

const router = Router();
router.use('/api', ApiRouter);
export default router;