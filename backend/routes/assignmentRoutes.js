// backend/routes/assignmentRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const auth = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');

const router = express.Router();

// ---- ensure upload directories exist ----
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const assignmentDir = path.join(uploadsRoot, 'assignments');
const submissionDir = path.join(uploadsRoot, 'assignment-submissions');

[uploadsRoot, assignmentDir, submissionDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// --- Multer storage helpers ---
function makeStorage(targetDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path
        .basename(file.originalname, ext)
        .replace(/\s+/g, '_');
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${base}-${unique}${ext}`);
    },
  });
}

// allow pdf + images for submissions
const assignmentUpload = multer({
  storage: makeStorage(assignmentDir),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for assignments.'));
    }
    cb(null, true);
  },
});

const submissionUpload = multer({
  storage: makeStorage(submissionDir),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('image/')
    ) {
      return cb(null, true);
    }
    cb(new Error('Only PDF or image files are allowed.'));
  },
});

// ---------------- TEACHER: CREATE ASSIGNMENT ----------------
// POST /api/assignments
router.post('/', auth, assignmentUpload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res
        .status(403)
        .json({ message: 'Only teachers can create assignments.' });
    }

    const { title, description, subject, className, dueDate } = req.body;

    if (!title || !className) {
      return res
        .status(400)
        .json({ message: 'Title and className are required.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Assignment PDF is required.' });
    }

    const filename = req.file.filename;
    const filePath = `/uploads/assignments/${filename}`;
    const fileUrl = `${req.protocol}://${req.get('host')}${filePath}`;

    const assignment = await Assignment.create({
      title,
      description: description || '',
      subject: subject || 'Misc',
      className: String(className),
      dueDate: dueDate ? new Date(dueDate) : null,
      filePath,
      fileUrl,
      createdBy: req.user.userId,
    });

    return res.status(201).json(assignment);
  } catch (err) {
    console.error('Error creating assignment:', err);
    return res.status(500).json({ message: 'Failed to create assignment.' });
  }
});

// ---------------- LIST ASSIGNMENTS (student or teacher) ----------------
// GET /api/assignments?className=10&subject=Maths
router.get('/', auth, async (req, res) => {
  try {
    const { className, subject } = req.query;
    const filter = {};

    if (className) filter.className = String(className);
    if (subject) filter.subject = subject;

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(assignments);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch assignments.' });
  }
});

// ---------------- TEACHER: DELETE ASSIGNMENT ----------------
// DELETE /api/assignments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res
        .status(403)
        .json({ message: 'Only teachers can delete assignments.' });
    }

    const id = req.params.id;

    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // delete submissions for this assignment too
    await AssignmentSubmission.deleteMany({ assignment: id });

    return res.json({ message: 'Assignment deleted.' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    return res.status(500).json({ message: 'Failed to delete assignment.' });
  }
});

// ---------------- STUDENT: SUBMIT ASSIGNMENT ----------------

// POST /api/assignments/:id/submit
router.post('/:id/submit', async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { name, email, className } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Submission file is required.' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // block second submission for this assignment + student
    const existing = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      email,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: 'You have already submitted this assignment.' });
    }

    const fileUrl = `/uploads/assignments/submissions/${req.file.filename}`;

    const submission = await AssignmentSubmission.create({
      assignment: assignmentId,
      name: name || '',
      email,
      className: className || '',
      filePath: fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    return res.status(201).json({
      message: 'Submission uploaded successfully.',
      submissionId: submission._id,
    });
  } catch (err) {
    console.error('Submit assignment error:', err);
    return res.status(500).json({ message: 'Failed to submit assignment.' });
  }
});

// GET /api/assignments/my-submissions?email=xyz@example.com
router.get('/my-submissions', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const submissions = await AssignmentSubmission.find({ email }).select(
      'assignment'
    );

    res.json(submissions);
  } catch (err) {
    console.error('GET /my-submissions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ---------------- TEACHER: VIEW SUBMISSIONS FOR ONE CLASS ----------------
// GET /api/assignments/:id/submissions?className=10
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res
        .status(403)
        .json({ message: 'Only teachers can see submissions.' });
    }

    const assignmentId = req.params.id;
    const { className } = req.query;

    const filter = { assignment: assignmentId };
    if (className) filter.className = String(className);

    const submissions = await AssignmentSubmission.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch submissions.' });
  }
});

module.exports = router;