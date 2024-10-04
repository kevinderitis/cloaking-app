import User from './models/userModel.js';

export const findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

export const createUser = async (userData) => {
    try {
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        return savedUser;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw new Error('No se pudo crear el usuario');
    }
};
