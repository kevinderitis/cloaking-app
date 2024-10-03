import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/config.js';
import { findUserByUsername, createUser } from '../dao/userDAO.js';

const googleRouter = Router();
const CLIENT_ID = config.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = config.GOOGLE_REDIRECT_URI;
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

googleRouter.get('/', (req, res) => {
    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email']
    });
    res.redirect(url);
});

googleRouter.get('/callback', async (req, res) => {
    try {
        const code = req.query.code;
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();

        const existingUser = await findUserByUsername(payload.email);
        let user;
        if (existingUser) {
            user = existingUser;
        } else {
            user = await createUser({ username: payload.email, firstName: payload.given_name, lastName: payload.family_name });
        }

        req.session.user = { username: user.username, name: user.firstName };
    } catch (error) {
        console.log(error);
    }

    res.redirect('/');
});

export default googleRouter;