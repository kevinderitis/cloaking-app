import Subscription from './models/subscriptionModel.js';

export const getSubscriptionsByUserId = async (userId) => {
    try {
        return await Subscription.find({ userId });
    } catch (error) {
        throw new Error('Error fetching subscriptions: ' + error.message);
    }
};

export const getSubscriptionByPlan = async (userId, plan) => {
    try {
        return await Subscription.findOne({ userId, plan });
    } catch (error) {
        throw new Error('Error fetching subscription: ' + error.message);
    }
};

export const createNewSubscription = async (subscriptionData) => {
    try {
        const newSubscription = new Subscription(subscriptionData);
        await newSubscription.save();
        return newSubscription;
    } catch (error) {
        throw new Error('Error creating subscription: ' + error.message);
    }
};

export const removeSubscription = async (userId, plan) => {
    try {
        const subscription = await Subscription.findOne({ userId, plan });

        if (!subscription) {
            throw new Error('Subscription not found or you do not have permission to delete it.');
        }

        await Subscription.deleteOne({ _id: subscription._id });
        return subscription;
    } catch (error) {
        throw new Error('Error deleting subscription: ' + error.message);
    }
};

export const hasActiveSubscription = async userId => {
    try {
        const subscriptions = await getSubscriptionsByUserId(userId);

        const today = new Date();

        const hasActiveSubscription = subscriptions.some(subscription => {
            return new Date(subscription.endDate) > today;
        });

        return hasActiveSubscription;
    } catch (error) {
        throw new Error('Error fetching subscriptions: ' + error.message);
    }
};


export const createTrialSubscription = async (userId) => {
    const trialDurationInDays = 3;
    const now = new Date();

    const newSubscription = {
        userId: userId,
        plan: 'trial',
        startDate: now,
        endDate: new Date(now.getTime() + trialDurationInDays * 24 * 60 * 60 * 1000),
        isActive: true,
    };

    try {
        await createNewSubscription(newSubscription)
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const addSubscriptionPayment = async (userId, amount) => {
    const PREMIUM_AMOUNT = 50;
    const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
    const plan = amount >= PREMIUM_AMOUNT ? 'premium' : 'basic';

    try {
        let existingSubscription = await getSubscriptionsByUserId(userId);

        if (existingSubscription && existingSubscription.length > 0) {
            let activeSubscription = existingSubscription.find(sub => new Date(sub.endDate) > new Date());

            if (activeSubscription) {
                activeSubscription.startDate = new Date(); 
                activeSubscription.endDate = new Date(Date.now() + ONE_MONTH_IN_MS); 
                activeSubscription.plan = plan; 
                activeSubscription.isActive = true;

                await activeSubscription.save(); 
                return activeSubscription;
            }
        }

        
        const newSubscription = {
            userId: userId,
            plan: plan,
            startDate: new Date(),
            endDate: new Date(Date.now() + ONE_MONTH_IN_MS), 
            isActive: true,
        };

        const createdSubscription = await createNewSubscription(newSubscription);
        return createdSubscription;

    } catch (error) {
        console.log('Error processing subscription payment:', error);
        throw new Error('Error processing subscription payment: ' + error.message);
    }
};