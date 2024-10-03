import { createTrialSubscription, getSubscriptionsByUserId } from "../dao/subscriptionDAO.js";
import { findUserByUsername } from "../dao/userDAO.js";

export const getUserSubscription = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not auth' });
    }

    try {
        const userId = req.session.user.username;
        const subscription = await getSubscriptionsByUserId(userId);
        res.status(200).json({ subscription });
    } catch (error) {
        console.error('Error al obtener cloaks:', error);
        res.status(500).json({ message: 'Error al obtener cloaks' });
    }
};

export const startTrial = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not auth' });
    }

    try {
        const userId = req.session.user.username;
        let subscription = await getSubscriptionsByUserId(userId);

        if (subscription.length > 0) {
            return res.status(400).json({ message: 'You have already used your trial.' });
        } else {
            subscription = await createTrialSubscription(userId);
        }

        res.status(200).json({ subscription });
    } catch (error) {
        console.error('Error al obtener cloaks:', error);
        res.status(500).json({ message: 'Error al obtener cloaks' });
    }
};

export const getUserData = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not auth' });
    }

    try {
        const userId = req.session.user.username;
        let user = await findUserByUsername(userId);

        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener cloaks:', error);
        res.status(500).json({ message: 'Error al obtener cloaks' });
    }
};