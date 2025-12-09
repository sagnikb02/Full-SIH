const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Required for sending emails
const User = require('../models/User');
const auth = require('../middleware/auth');

// Fixed referral codes for classes 1–10
const CLASS_REFERRAL_CODES = {
  '1':  '0145', '2':  '2381', '3':  '3674', '4':  '4920', '5':  '5063',
  '6':  '6198', '7':  '7432', '8':  '8591', '9':  '9736', '10': '1084',
};

// Temporary store for signup OTPs (email -> { otp, expiresAt })
const pendingSignupOtps = {};

const router = express.Router();

function buildUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    className: user.className || null,
    department: user.department || null,
    parentAccessCode: user.parentAccessCode || null,
    parentOf: user.parentOf || null,
  };
}

/* =========================================
   STANDARD AUTH ROUTES
   ========================================= */

// POST /api/auth/register/send-otp
router.post('/register/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // Do not send OTP if account already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingSignupOtps[normalizedEmail] = { otp, expiresAt };

    // Reuse same Nodemailer style as forgot-password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: 'eShiksha Support <eshiksha@gmail.com>',
      to: normalizedEmail,
      subject: 'Account Activation OTP',
      text: `Your OTP is ${otp}. Valid for 10 minutes.`
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Register send-otp error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
        const {
          name,
          email,
          password,
          role,
          referralCode,
          studentCode,
          otp,
          parentPhone,        // 🔹 NEW
        } = req.body;


    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // ----- OTP CHECK -----
    const pending = pendingSignupOtps[normalizedEmail];
    if (!pending) {
      return res.status(400).json({ message: 'No OTP request found or OTP expired. Please request a new code.' });
    }

    if (pending.expiresAt < Date.now()) {
      delete pendingSignupOtps[normalizedEmail];
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    // ----------------------

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let className = null;
    let parentOf = null;

    if (role === 'student') {
      if (!referralCode) {
        return res.status(400).json({ message: 'Referral code is required.' });
      }
      className = Object.keys(CLASS_REFERRAL_CODES).find(
        (cls) => CLASS_REFERRAL_CODES[cls] === referralCode.trim()
      );
      if (!className) {
        return res.status(400).json({ message: 'Invalid referral code.' });
      }
    }

    if (role === 'parent') {
      if (!studentCode) {
        return res.status(400).json({ message: 'Student access code required.' });
      }
      const student = await User.findOne({ role: 'student', parentAccessCode: studentCode.trim() });
      if (!student) {
        return res.status(400).json({ message: 'Invalid student access code.' });
      }
      parentOf = student._id;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      className,
      parentOf,
      parentPhone: parentPhone ? parentPhone.trim() : undefined,
    });
  

    await user.save();

    // OTP is used; clean it up
    delete pendingSignupOtps[normalizedEmail];

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password || '', user.passwordHash || '');
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: buildUserResponse(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(buildUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/auth/class
router.patch('/class', auth, async (req, res) => {
  try {
    const { className } = req.body;
    if (!className) return res.status(400).json({ message: 'className is required' });
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can change class' });

    const user = await User.findByIdAndUpdate(req.user.userId, { className }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(buildUserResponse(user));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/referral-code', auth, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can view codes.' });
    }

    const { className } = req.query;
    if (!className) {
      return res.status(400).json({ message: 'className is required.' });
    }

    const code = CLASS_REFERRAL_CODES[String(className)];
    if (!code) {
      return res.status(400).json({ message: 'No code found.' });
    }

    return res.json({ className: String(className), referralCode: code });
  } catch (err) {
    console.error('GET /auth/referral-code error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// POST /api/auth/logout
router.post('/logout', auth, (req, res) => {
  try {
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* =========================================
   FORGOT PASSWORD FLOW
   ========================================= */

// 1. Generate OTP & Send Email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB (valid for 10 mins)
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // --- PASTE 1: NODEMAILER CODE HERE ---
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER, // e.g., 'eshiksha@gmail.com'
        pass: process.env.EMAIL_PASS  // e.g., 'your-app-password'
      }
    });

    await transporter.sendMail({
      from: 'eShiksha Support <eshiksha@gmail.com>',
      to: normalizedEmail,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. Valid for 10 minutes.`
    });
    // -------------------------------------

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail, 
      resetOtp: otp, 
      resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail, 
      resetOtp: otp, 
      resetOtpExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: 'Invalid session' });

    // --- PASTE 2: PASSWORD CHECK CODE HERE ---
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
        return res.status(400).json({ message: "New password cannot be the same as the old one." });
    }
    // -----------------------------------------

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    // Clear OTP
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;