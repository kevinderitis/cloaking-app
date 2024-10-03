import { getSubscriptionsByUserId } from "../dao/subscriptionDAO.js";

export const getUserSubscription = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No autenticado' });
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