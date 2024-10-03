import User from './models/userModel.js'; 

export const findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

export const createUser = async (userData) => {
    const newUser = new User(userData);
    return await newUser.save();
};