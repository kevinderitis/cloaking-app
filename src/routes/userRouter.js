import { Router } from 'express';
import { getUserSubscription, startTrial, getUserData } from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/subscription', getUserSubscription);

userRouter.get('/trial', startTrial);

userRouter.get('/data', getUserData);

export default userRouter;