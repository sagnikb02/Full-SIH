// backend/routes/videoRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Video = require('../models/Video');

const router = express.Router();

// --- Ensure upload directories exist ---
// backend/uploads/videos
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const videoDir = path.join(uploadsRoot, 'videos');
const notesDir = path.join(uploadsRoot, 'notes');

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot);
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir);
}
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// --- Multer storage ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'video') {
      cb(null, videoDir);
    } else if (file.fieldname === 'notes') {
      cb(null, notesDir);
    } else {
      cb(new Error('Unknown file field'));
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const rawBase = path.basename(file.originalname, ext);

    const safeBase = rawBase
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${safeBase}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video files are allowed for video field.'));
      }
      return cb(null, true);
    }

    if (file.fieldname === 'notes') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed for notes.'));
      }
      return cb(null, true);
    }

    return cb(new Error('Unknown file field.'));
  },
});

// ---------- POST /api/videos ----------
// expects: title, subject, className, type, description, attachedQuizId (optional)
// and file fields: "video" (required) and "notes" (optional)
router.post(
  '/',
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'notes', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        subject,
        className,
        type,
        description,
        attachedQuizId,
      } = req.body;

      const videoFile = req.files?.video?.[0];
      const notesFile = req.files?.notes?.[0];

      if (!videoFile) {
        return res.status(400).json({ message: 'Video file is required.' });
      }
      if (!title || !subject || !className) {
        return res.status(400).json({
          message: 'Title, subject and className are required.',
        });
      }

      const baseUrl =
        process.env.BACKEND_PUBLIC_URL || 'http://localhost:5000';

      // VIDEO
      const videoFilePath = `/uploads/videos/${videoFile.filename}`;
      const videoFileUrl = `${baseUrl}${videoFilePath}`;

      // NOTES (optional)
      let notesPath = '';
      let notesUrl = '';
      if (notesFile) {
        notesPath = `/uploads/notes/${notesFile.filename}`;
        notesUrl = `${baseUrl}${notesPath}`;
      }

      // Optional attached quiz
      let attachedQuiz = null;
      if (attachedQuizId && mongoose.Types.ObjectId.isValid(attachedQuizId)) {
        attachedQuiz = attachedQuizId;
      }

      const video = new Video({
        title,
        subject,
        className: String(className),
        type: type === 'short' ? 'short' : 'long',
        filename: videoFile.filename,
        filePath: videoFilePath,
        fileUrl: videoFileUrl,
        mimeType: videoFile.mimetype,
        size: videoFile.size,

        description: description || '',
        notesPath,
        notesUrl,
        attachedQuiz,
      });

      const saved = await video.save();
      return res.status(201).json(saved);
    } catch (err) {
      console.error('Error saving video:', err);
      return res
        .status(500)
        .json({ message: 'Failed to save video.', error: err.message });
    }
  }
);

// ---------- GET /api/videos ----------
// optional query: ?className=10&subject=Maths
router.get('/', async (req, res) => {
  try {
    const { className, subject } = req.query;
    const filter = {};

    if (className) filter.className = String(className);
    if (subject) filter.subject = subject;

    const videos = await Video.find(filter)
      .populate('attachedQuiz', 'title subject className questions')
      .sort({ createdAt: -1 });

    return res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    return res.status(500).json({ message: 'Failed to fetch videos.' });
  }
});

// ---------- DELETE /api/videos/:id ----------
// deletes DB record + physical video file (and notes file if present)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    // Delete video file
    const videoFilename =
      video.filename || (video.filePath ? path.basename(video.filePath) : null);
    if (videoFilename) {
      const fullVideoPath = path.join(videoDir, videoFilename);
      try {
        if (fs.existsSync(fullVideoPath)) {
          fs.unlinkSync(fullVideoPath);
        }
      } catch (fileErr) {
        console.error('Error deleting video file:', fileErr);
      }
    }

    // Delete notes file if present
    if (video.notesPath) {
      const notesFilename = path.basename(video.notesPath);
      const fullNotesPath = path.join(notesDir, notesFilename);
      try {
        if (fs.existsSync(fullNotesPath)) {
          fs.unlinkSync(fullNotesPath);
        }
      } catch (fileErr) {
        console.error('Error deleting notes file:', fileErr);
      }
    }

    await video.deleteOne();

    return res.json({ message: 'Video deleted successfully.' });
  } catch (err) {
    console.error('Error deleting video:', err);
    return res.status(500).json({ message: 'Failed to delete video.' });
  }
});

// ---------- LATEST COMMENTS (for teacher notifications) ----------
// GET /api/videos/comments/recent?className=8&limit=10
// (also available as /comments/latest for safety)
async function latestCommentsHandler(req, res) {
  try {
    const { className, limit = 10 } = req.query;
    if (!className) {
      return res.status(400).json({ message: 'className is required' });
    }

    const videos = await Video.find({ className: String(className) }).select(
      'title className comments'
    );

    const allComments = [];
    videos.forEach((v) => {
      (v.comments || []).forEach((c) => {
        allComments.push({
          videoId: v._id,
          videoTitle: v.title,
          className: v.className,
          comment: c,
        });
      });
    });

    allComments.sort(
      (a, b) =>
        new Date(b.comment.createdAt || 0) - new Date(a.comment.createdAt || 0)
    );

    return res.json(allComments.slice(0, Number(limit)));
  } catch (err) {
    console.error('Error fetching latest comments:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch latest comments' });
  }
}

router.get('/comments/recent', latestCommentsHandler);
router.get('/comments/latest', latestCommentsHandler);

// ---------- PER-VIDEO COMMENTS ----------
// GET /api/videos/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('comments');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    return res.json(video.comments || []);
  } catch (err) {
    console.error('Error fetching comments:', err);
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// POST /api/videos/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, authorName, authorEmail, role } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const newComment = {
      text: text.trim(),
      authorName,
      authorEmail,
      role,
      createdAt: new Date(),
    };

    video.comments.push(newComment);
    await video.save();

    const saved = video.comments[video.comments.length - 1];
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating comment:', err);
    return res.status(500).json({ message: 'Failed to create comment' });
  }
});

module.exports = router;
