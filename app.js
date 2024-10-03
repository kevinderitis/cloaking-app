import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import authRouter from './src/routes/authRouter.js';
import cloakRouter from './src/routes/cloakRouter.js';
import userRouter from './src/routes/userRouter.js';
import googleRouter from './src/routes/googleRouter.js';
import cors from 'cors';
import { config } from './src/config/config.js';
import { processCloakingRedirect } from './src/controllers/cloakController.js';

const app = express();
const PORT = config.PORT;

mongoose.connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve('public')));

app.use('/auth', authRouter);
app.use('/cloak', cloakRouter);
app.use('/user', userRouter);
app.use('/google', googleRouter);

app.get('/*', processCloakingRedirect);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});