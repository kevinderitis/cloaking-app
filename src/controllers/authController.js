import { createUser, findUserByUsername } from '../dao/userDAO.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const signup = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const existingUser = await findUserByUsername(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        await createUser({ username: email, password: hashedPassword, firstName, lastName });

        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error('Error en el signup:', error);
        res.status(500).json({ message: 'Error al crear el usuario' });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = { username: user.username, name: user.firstName };
                return res.status(200).json({ message: 'Login exitoso' });
            }
        }

        res.status(401).json({ message: 'Credenciales incorrectas' });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        res.status(200).json({ message: 'Logout exitoso' });
    });
};

export const checkSession = (req, res) => {
    if (req.session.user) { 
        return res.json({ loggedIn: true });
    }
    res.json({ loggedIn: false });
};

