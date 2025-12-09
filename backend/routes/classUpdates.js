// backend/routes/classUpdates.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple schema if you haven't made one yet
const classUpdateSchema = new mongoose.Schema(
  {
    className: { type: String, required: true },
    message:   { type: String, required: true },
    createdBy: { type: String }, // teacher name/email/id – optional
  },
  { timestamps: true }
);

const ClassUpdate =
  mongoose.models.ClassUpdate || mongoose.model('ClassUpdate', classUpdateSchema);

// GET /api/class-updates?className=8&limit=5
router.get('/', async (req, res) => {
  try {
    const { className, limit = 5 } = req.query;

    if (!className) {
      return res.status(400).json({ message: 'className query param is required' });
    }

    const items = await ClassUpdate
      .find({ className })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(items);
  } catch (err) {
    console.error('Error fetching class updates', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/class-updates  body: { className, message }
router.post('/', async (req, res) => {
  try {
    const { className, message, text } = req.body;

    // accept either message or text from frontend
    const finalMessage = (message || text || '').trim();

    if (!className || !finalMessage) {
      return res
        .status(400)
        .json({ message: 'className and message are required' });
    }

    const createdBy =
      req.user?.name || req.user?.email || 'Teacher';

    const update = await ClassUpdate.create({
      className,
      message: finalMessage,
      createdBy,
    });

    res.status(201).json(update);
  } catch (err) {
    console.error('Error creating class update', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
