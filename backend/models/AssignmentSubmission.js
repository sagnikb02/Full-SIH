// backend/models/AssignmentSubmission.js
const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    // who submitted
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },

    // file (pdf/jpg/png)
    filePath: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
