import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from './models/auth.js';
import Question from './models/question.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// CORS setup
app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend origin
    credentials: true, // Allow credentials (cookies, auth headers)
  })
);

app.use(express.json());

// Connect to MongoDB
const PORT = 5000;
const connectionString = 'mongodb://localhost:27017/yourDatabase';

mongoose
  .connect(connectionString)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (id, role) to the request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { fullname, email, password, confirmPassword, role } = req.body;

  if (!['teacher', 'student'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selected' });
  }

  try {
    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint for teachers to create questions
// Endpoint for teachers to create questions
app.post('/api/questions', authenticateToken, async (req, res) => {
    const { question, options, correctOption, examDuration } = req.body;
  
    // Log incoming request for debugging
    console.log('Request Body:', req.body);
  
    // Validation: Ensure required fields are provided and options are valid
    if (!question || !options || options.length !== 4 || correctOption === undefined || correctOption < 0 || correctOption > 3 || !examDuration) {
      return res.status(400).json({ message: 'Please fill in all fields correctly. Ensure options array has 4 items and correctOption is between 0 and 3.' });
    }
  
    // Create a new question
    try {
      const newQuestion = new Question({
        question,
        options,
        correctOption,
        examDuration,
        createdBy: req.user.id, // Ensure the createdBy field is set from JWT token
      });
  
      await newQuestion.save();
      res.status(201).json({ message: 'Question created successfully.' });
    } catch (err) {
      console.error('Error while saving question:', err); // Log detailed error
      res.status(500).json({ message: 'Failed to create question.', error: err.message });
    }
  });
  
// Endpoint for students to fetch questions
app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
