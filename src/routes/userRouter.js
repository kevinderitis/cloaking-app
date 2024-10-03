import { Router } from 'express';
import { getUserSubscription } from '../controllers/userController.js';

const userRouter = Router();

userRouter.get('/subscription', getUserSubscription);

export default userRouter;