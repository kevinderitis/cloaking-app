import express from 'express';
import { login, logout, checkSession, signup } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);

authRouter.post('/login', login);

authRouter.get('/logout', logout);

authRouter.get('/check-session', checkSession);

export default authRouter;