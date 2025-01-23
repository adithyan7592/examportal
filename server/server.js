import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/auth.js';
import Question from './models/question.js';
import Answer from './models/answer.js';
import Quiz from './models/quiz.js';
import Contact from './models/contact.js';

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

// MongoDB connection
const PORT = 5000;
const connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/yourDatabase';

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
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ message: 'Contact form submitted successfully!' });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({ message: 'Failed to submit contact form.', error: error.message });
  }
});

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

// Endpoint to fetch all questions (for teachers and students)
app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find()
      .select('question options examDuration')
      .populate('createdBy', 'fullname email');

    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
});

// Ranking API
app.get('/api/ranking', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized: Only teachers can view rankings.' });
    }

    const answers = await Answer.find().populate('student question');

    // Calculate ranking based on correct answers
    const rankingMap = new Map();

    answers.forEach((answer) => {
      const studentId = answer.student._id.toString();
      if (!rankingMap.has(studentId)) {
        rankingMap.set(studentId, {
          studentName: answer.student.fullname,
          correctAnswersCount: 0,
          quizzesTaken: new Map(),
        });
      }

      const studentData = rankingMap.get(studentId);
      if (answer.isCorrect) {
        studentData.correctAnswersCount++;
      }

      const quiz = studentData.quizzesTaken.get(answer.quizTitle) || { quizTitle: answer.quizTitle, correctAnswers: 0 };
      if (answer.isCorrect) {
        quiz.correctAnswers++;
      }
      studentData.quizzesTaken.set(answer.quizTitle, quiz);
    });

    // Transform ranking map into an array
    const ranking = Array.from(rankingMap.values()).map((student) => ({
      studentName: student.studentName,
      correctAnswersCount: student.correctAnswersCount,
      quizzesTaken: Array.from(student.quizzesTaken.values()),
    }));

    // Sort by correct answers (descending)
    ranking.sort((a, b) => b.correctAnswersCount - a.correctAnswersCount);

    res.status(200).json(ranking);
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    res.status(500).json({ message: 'Failed to fetch rankings', error: error.message });
  }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized: You must be a teacher.' });
    }

    const { quizTitle, question, options, correctOption, examDuration } = req.body;

    if (!quizTitle || !question || options.length < 4 || correctOption < 0 || correctOption > 3 || examDuration <= 0) {
      return res.status(400).json({ message: 'Invalid data provided. All fields are required.' });
    }

    // Check if the quiz exists
    let quiz = await Quiz.findOne({ title: quizTitle });
    if (!quiz) {
      // If the quiz doesn't exist, create a new one for the teacher
      quiz = new Quiz({
        title: quizTitle,
        createdBy: req.user.id,
      });

      await quiz.save();
      console.log(`Quiz with title "${quizTitle}" created.`);
    }

    
    const newQuestion = new Question({
      quizTitle,
      question,
      options,
      correctOption,
      examDuration,
      createdBy: req.user.id,
    });

    await newQuestion.save();
    res.status(201).json({ message: 'Question created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
});

// Endpoint to edit a quiz 
app.put('/api/quizzes/:quizId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Unauthorized: You must be a teacher.' });
  }

  const { quizId } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Quiz title is required.' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    quiz.title = title;
    await quiz.save();
    res.status(200).json({ message: 'Quiz updated successfully.', title: quiz.title });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ message: 'Failed to update quiz', error: err.message });
  }
});

// Endpoint to delete a quiz 
app.delete('/api/quizzes/:quizId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Unauthorized: You must be a teacher.' });
    }

    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    await quiz.remove();
    res.status(200).json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    console.error(err);  // Log the error for more insight
    res.status(500).json({ message: 'Failed to delete quiz.', error: err.message });
  }
});


// Endpoint to submit answers (For students)
app.post('/api/submit-answers', authenticateToken, async (req, res) => {
  try {
    const { answers, quizTitle } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: 'No answers submitted.' });
    }

    if (!quizTitle) {
      return res.status(400).json({ message: 'Quiz title is required.' });
    }

    for (const [questionId, answerIndex] of Object.entries(answers)) {
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(400).json({ message: `Question with ID ${questionId} does not exist.` });
      }

      const isCorrect = question.correctOption === answerIndex;

      const answer = new Answer({
        student: req.user.id,
        question: questionId,
        answer: answerIndex,
        isCorrect,
        quizTitle,
      });

      await answer.save();
    }

    res.status(200).json({ message: 'Answers submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit answers', error: err.message });
  }
});

// Endpoint to fetch answered questions for the logged-in student
app.get('/api/student-answers', authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Unauthorized: You must be a student' });
    }

    const answers = await Answer.find({ student: req.user.id }).populate('question');

    if (!answers.length) {
      return res.status(404).json({ message: 'No answers found for this student' });
    }

    const response = answers.map(answer => ({
      questionText: answer.question.question,
      options: answer.question.options,
      studentAnswer: answer.answer,
      isCorrect: answer.isCorrect,
      quizTitle: answer.quizTitle,
    }));

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});


// Quiz creation and management (teachers only)
app.post('/api/quizzes', authenticateToken, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Unauthorized: You must be a teacher.' });
  }

  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Quiz title is required.' });
  }

  const newQuiz = new Quiz({ title, createdBy: req.user.id });
  await newQuiz.save();

  res.status(201).json({ message: 'Quiz created successfully.', quiz: newQuiz });
});

app.get('/api/quizzes', authenticateToken, async (req, res) => {
  const quizzes = await Quiz.find().populate('createdBy', 'fullname');
  res.status(200).json(quizzes);
});

app.get('/api/quizzes/:quizId/questions', authenticateToken, async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    const questions = await Question.find({ quizTitle: quiz.title });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});








