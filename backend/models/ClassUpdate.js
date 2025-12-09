// models/ClassUpdate.js
const mongoose = require('mongoose');

const classUpdateSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true, // e.g. "8" or "Class 8"
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional: info about who posted the update
    postedBy: {
      name: { type: String },
      email: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, default: 'teacher' },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model('ClassUpdate', classUpdateSchema);
