import Cloak from './models/cloakModel.js';

export const getCloaksByUserId = async (userId) => {
    return await Cloak.find({ userId });
};

export const getCloakByName = async (name) => {
    return await Cloak.findOne({ name });
};

export const createNewCloak = async (cloakData) => {
    try {
        const newCloak = new Cloak(cloakData); 
        await newCloak.save(); 
        return newCloak; 
    } catch (error) {
        throw new Error('Error creating cloak: ' + error.message); 
    }
};

export const removeCloak = async (name, userId) => {
    const cloak = await Cloak.findOne({ name, userId });

    if (!cloak) {
        throw new Error('Cloak not found or you do not have permission to delete it.');
    }

    await Cloak.deleteOne({ _id: cloak._id });

    return cloak;
};
