// backend/models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Class the assignment belongs to (e.g. "10")
    className: { type: String, required: true, trim: true },

    // Subject like in videos
    subject: {
      type: String,
      enum: ['Science', 'SST', 'Maths', 'English', 'Second Language', 'Misc'],
      default: 'Misc',
    },

    // optional
    dueDate: { type: Date },

    // file info (PDF, etc.)
    filePath: { type: String, required: true }, // relative path under /uploads
    fileUrl: { type: String, required: true },  // full URL http://.../uploads/...

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
