// routes/parentRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');

const router = express.Router();

// simple helper
function generateParentCode() {
  // 8-char alphanumeric
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * POST /api/parent/generate-code
 *
 * - If TEACHER:
 *    body: { studentEmail } OR { studentId }
 *    -> generate (if missing) a parentAccessCode for that student
 *
 * - If STUDENT:
 *    no body needed
 *    -> genreate (if missing) a parentAccessCode for the LOGGED-IN student
 */
router.post('/generate-code', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;

    // ---------------- TEACHER FLOW (your existing logic) ----------------
    if (role === 'teacher') {
      const { studentEmail, studentId } = req.body;
      let student;

      if (studentId) {
        student = await User.findOne({ _id: studentId, role: 'student' });
      } else if (studentEmail) {
        student = await User.findOne({
          email: (studentEmail || '').toLowerCase(),
          role: 'student',
        });
      } else {
        return res
          .status(400)
          .json({ message: 'studentEmail or studentId is required.' });
      }

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }

      // generate only if missing
      if (!student.parentAccessCode) {
        // ensure uniqueness (optional but safer with unique index)
        let code;
        let exists = true;
        while (exists) {
          code = generateParentCode();
          const existing = await User.findOne({ parentAccessCode: code });
          exists = !!existing;
        }
        student.parentAccessCode = code;
        await student.save();
      }

      return res.json({
        studentId: student._id,
        name: student.name,
        className: student.className,
        parentAccessCode: student.parentAccessCode,
        generatedBy: 'teacher',
      });
    }

    // ---------------- STUDENT FLOW (new) ----------------
    if (role === 'student') {
      const student = await User.findById(userId);

      if (!student || student.role !== 'student') {
        return res.status(404).json({ message: 'Student not found.' });
      }

      if (!student.parentAccessCode) {
        // generate unique code for this student
        let code;
        let exists = true;
        while (exists) {
          code = generateParentCode();
          const existing = await User.findOne({ parentAccessCode: code });
          exists = !!existing;
        }
        student.parentAccessCode = code;
        await student.save();
      }

      return res.json({
        studentId: student._id,
        name: student.name,
        className: student.className,
        parentAccessCode: student.parentAccessCode,
        generatedBy: 'student',
      });
    }

    // ---------------- other roles blocked ----------------
    return res
      .status(403)
      .json({ message: 'Only teachers or students can generate parent codes.' });
  } catch (err) {
    console.error('Generate parent code error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/parent/overview
router.get('/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res
        .status(403)
        .json({ message: 'Only parents can access this.' });
    }

    const parent = await User.findById(req.user.userId).populate('parentOf');

    if (!parent || !parent.parentOf) {
      return res
        .status(400)
        .json({ message: 'No linked student found for this parent.' });
    }

    const student = parent.parentOf;

    // all quiz attempts for this student (using email like we did elsewhere)
    const attempts = await QuizAttempt.find({
      email: student.email,
    })
      .populate('quiz', 'title subject className questions')
      .sort({ createdAt: -1 });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        className: student.className,
      },
      attempts,
    });
  } catch (err) {
    console.error('Parent overview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;