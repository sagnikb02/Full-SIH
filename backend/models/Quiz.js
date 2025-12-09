// models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String },
    className: { type: String }, // like "10-A"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String },
    questions: [questionSchema],
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
