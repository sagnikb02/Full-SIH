const mongoose = require('mongoose');


const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    // who took the quiz
    name: String,
    email: {
      type: String,
      required: true,
      trim: true,
    },
    className: String,

    // basic stats
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },

    // store chosen option index per question (-1 for not answered)
    answers: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

// each student can submit each quiz only once
quizAttemptSchema.index({ quiz: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
