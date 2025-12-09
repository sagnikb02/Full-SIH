// backend/models/Video.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    authorName: { type: String, default: 'Student' },
    authorEmail: { type: String },
    role: { type: String }, // 'student', 'teacher', etc.
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // e.g. "5", "10"
    className: {
      type: String,
      required: true,
      trim: true,
    },

    // Science / SST / Maths / English / Second Language / Misc
    subject: {
      type: String,
      enum: [
        'Science',
        'SST',
        'Maths',
        'English',
        'Second Language',
        'Misc',
      ],
      default: 'Misc',
    },

    // for future if you ever add shorts from backend
    type: {
      type: String,
      enum: ['long', 'short'],
      default: 'long',
    },

    // Where the *video* file is stored on disk (relative path)
    filePath: {
      type: String,
      required: true,
    },

    // URL you’ll serve to the frontend for the <video>
    fileUrl: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
    },
    size: {
      type: Number,
    },

    // Teacher-written description for this lesson
    description: {
      type: String,
      default: '',
      trim: true,
    },

    // Optional notes PDF
    notesPath: {
      type: String,
      default: '',
    },
    notesUrl: {
      type: String,
      default: '',
    },

    // Optional: quiz attached to this video
    attachedQuiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null,
    },

    // Who uploaded it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Embedded comments / doubts
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
