import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URL: process.env.MONGO_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    TRC20_WALLET: process.env.TRC20_WALLET,
    TRONSCAN_API_BASE_URL: process.env.TRONSCAN_API_BASE_URL
};