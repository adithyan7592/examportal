import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Update CORS to allow credentials and specific origin
app.use(
  cors({
    origin: 'http://localhost:5173', // Change to your frontend's origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(express.json());

const PORT = 5000;
const connectionString = 'mongodb://localhost:27017/yourDatabase';

mongoose.connect(connectionString)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log('MongoDB connection error:', error));

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { fullname, email, password, confirmPassword , role } = req.body;
    if (!['teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: "Invalid role selected" });
    }

    try {
        if (!fullname || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            fullname,
            email,
            password: hashedPassword,
            role
        });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login endpoint with JWT
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if email or password is empty
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id , role: user.role  }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with token and user data (excluding password)
        res.json({
            token,
            user: {
                id: user._id,
                username: user.fullname,
                email: user.email
            
            }
        });
    } catch (error) {
        console.error('Error during login:', error);  // Log the error to console
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

