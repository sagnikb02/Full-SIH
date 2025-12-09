// routes/quizRoutes.js
const express = require('express');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const auth = require('../middleware/auth');
const QuizAttempt = require('../models/QuizAttempt');

const router = express.Router();

// GET /api/quizzes?className=10
// Create quiz (teachers only, but with robust role check + logging)
router.post('/', auth, async (req, res) => {
  try {
    // Debug: see what auth middleware put on req.user
    console.log('POST /api/quizzes user from token:', req.user);

    const role = (req.user?.role || '')
      .toString()
      .trim()
      .toLowerCase();

    // Allow teacher / admin (and you can add more if needed)
    const allowedRoles = ['teacher', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: 'Only teachers can create quizzes' });
    }

    const { title, subject, className, dueDate, questions } = req.body;

    if (!title || !className || !questions || questions.length === 0) {
      return res.status(400).json({
        message:
          'Title, className and at least one question are required.',
      });
    }

    // Get teacher's department (optional, only if you care)
    const teacher = await User.findById(req.user.userId).select('department');
    const department = teacher?.department || null;

    const quiz = new Quiz({
      title,
      subject,
      className,
      dueDate,
      questions,
      createdBy: req.user.userId,
      // department, // uncomment if you add department to Quiz schema
    });

    await quiz.save();
    return res.status(201).json(quiz);
  } catch (err) {
    console.error('Create quiz error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



// POST /api/quizzes
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Only teachers can create quizzes' });

    const { title, subject, className, dueDate, questions } = req.body;
    if (!title || !className || !questions?.length)
      return res.status(400).json({ message: 'Title, className and at least one question are required.' });

    const teacher = await User.findById(req.user.userId).select('department');

    const quiz = new Quiz({
      title,
      subject,
      className,
      dueDate,
      questions,
      createdBy: req.user.userId
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quizzes/attempts/by-class
router.get('/attempts/by-class', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Only teachers can view class attempts.' });

    const { className } = req.query;
    if (!className)
      return res.status(400).json({ message: 'className query is required.' });

    const attempts = await QuizAttempt.find({ className: String(className) })
      .populate('quiz', 'title subject className questions')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch attempts.' });
  }
});

// GET /api/quizzes/class-progress
router.get('/class-progress', async (req, res) => {
  try {
    const { className } = req.query;
    if (!className)
      return res.status(400).json({ message: 'className query is required.' });

    const quizzes = await Quiz.find({ className: String(className) }).select('_id');
    const quizIds = quizzes.map(q => q._id);
    const totalQuizzes = quizIds.length;

    if (!totalQuizzes) return res.json([]);

    const agg = await QuizAttempt.aggregate([
      { $match: { className: String(className), quiz: { $in: quizIds } } },
      {
        $group: {
          _id: '$email',
          name: { $first: '$name' },
          attemptsCount: { $sum: 1 },
          avgPercent: {
            $avg: { $multiply: [{ $divide: ['$score', '$total'] }, 100] }
          }
        }
      }
    ]);

    const result = agg.map(a => ({
      email: a._id,
      name: a.name || a._id,
      className,
      attemptsCount: a.attemptsCount,
      totalQuizzes,
      avgScore: Number(a.avgPercent?.toFixed(1) || 0),
      attendancePercent: Number(((a.attemptsCount / totalQuizzes) * 100).toFixed(1))
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute class progress.' });
  }
});

/**
 *  UPDATED: POST /api/quizzes/:id/submit
 * Prevents duplicate submissions (clean)
 */
router.post('/:id/submit', async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers, name, email, className } = req.body;

    if (!Array.isArray(answers))
      return res.status(400).json({ message: 'Answers array is required.' });

    if (!email)
      return res.status(400).json({ message: 'Email is required.' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res.status(404).json({ message: 'Quiz not found' });

    const total = quiz.questions.length;

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });

    const attempt = new QuizAttempt({
      quiz: quizId,
      name: name || '',
      email,
      className: className || '',
      score,
      total,
      answers
    });

    await attempt.save();

    res.status(201).json({
      message: 'Submission recorded.',
      score: attempt.score,
      total: attempt.total,
      alreadySubmitted: false
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'You have already submitted this quiz.',
        alreadySubmitted: true
      });
    }

    console.error(err);
    res.status(500).json({ message: 'Failed to submit quiz.' });
  }
});

// GET /api/quizzes/attempts/by-student
router.get('/attempts/by-student', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ message: 'Email is required.' });

    const attempts = await QuizAttempt.find({ email }).select('quiz score total createdAt');
    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch attempts.' });
  }
});

// GET /api/quizzes/:id
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz)
      return res.status(404).json({ message: 'Quiz not found' });

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// DELETE /api/quizzes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Only teachers can delete quizzes.' });

    const quizId = req.params.id;

    const quiz = await Quiz.findByIdAndDelete(quizId);
    if (!quiz)
      return res.status(404).json({ message: 'Quiz not found.' });

    await QuizAttempt.deleteMany({ quiz: quizId });

    res.json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting quiz.' });
  }
});

module.exports = router;
