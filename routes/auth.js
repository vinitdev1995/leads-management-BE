
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

const readDB = async () => {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
};

const writeDB = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

router.post('/register', async (req, res) => {
    try {
        const { username, password, name, email } = req.body;

        if (!username || !password || !name || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const db = await readDB();

        const userExists = db.users.some(user => user.username === username);
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: uuidv4(),
            username,
            password: hashedPassword,
            name,
            email,
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        await writeDB(db);

        const token = jwt.sign(
            { userId: newUser.id, username: newUser.username },
            'your-secret-key',
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const db = await readDB();

        const user = db.users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            'your-secret-key',
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});


module.exports = router;