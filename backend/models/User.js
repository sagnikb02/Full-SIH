// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Phone number where results SMS will be sent (mainly for students)
    // IMPORTANT: not required at schema level so teachers/parents can leave it blank
    parentPhone: {
      type: String,
      trim: true,
      // DO NOT put "required: true" here
    },

    // make codes unique globally, but optional
    parentAccessCode: { type: String, unique: true, sparse: true },

    // for parent users: which student is this parent tracking?
    parentOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ['student', 'teacher', 'parent'],
      required: true,
    },

    className: { type: String },    // e.g. "10"
    department: { type: String },   // e.g. "Science"

    // --- FORGOT PASSWORD FIELDS ---
    resetOtp: { type: String },
    resetOtpExpire: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
