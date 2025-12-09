const express = require('express');
const router = express.Router();

const User = require('../models/User'); // adjust path if file is named differently
const auth = require('../middleware/auth');

// GET /api/users/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const studentCount = await User.countDocuments({ role: 'student' });

    res.json({
      totalUsers,
      studentCount,
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
});

// GET /api/users/stats/by-class?className=7
// Returns total students in that class
router.get('/stats/by-class', auth, async (req, res) => {
  try {
    const { className } = req.query;
    if (!className) {
      return res.status(400).json({ message: 'className is required' });
    }

    const totalStudents = await User.countDocuments({
      role: 'student',
      className: String(className),
    });

    return res.json({ totalStudents });
  } catch (err) {
    console.error('Error in /api/users/stats/by-class:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch class stats.' });
  }
});


module.exports = router;