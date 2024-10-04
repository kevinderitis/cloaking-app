import { Router } from 'express';
import { getUserSubscription, startTrial, getUserData, createSubscriptionOrder } from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/subscription', getUserSubscription);

userRouter.get('/trial', startTrial);

userRouter.get('/data', getUserData);

userRouter.post('/payment', createSubscriptionOrder);

export default userRouter;