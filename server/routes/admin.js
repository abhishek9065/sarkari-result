const express = require('express');
const Job = require('../models/Job');
const Result = require('../models/Result');
const AdmitCard = require('../models/AdmitCard');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get dashboard stats (Admin only)
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalResults,
      totalAdmitCards,
      totalUsers,
      recentJobs,
      recentResults,
      recentAdmitCards
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Result.countDocuments(),
      AdmitCard.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Job.find().sort({ createdAt: -1 }).limit(5).select('title organization createdAt'),
      Result.find().sort({ createdAt: -1 }).limit(5).select('title organization resultDate'),
      AdmitCard.find().sort({ createdAt: -1 }).limit(5).select('title organization examDate')
    ]);

    res.json({
      stats: {
        totalJobs,
        activeJobs,
        totalResults,
        totalAdmitCards,
        totalUsers
      },
      recent: {
        jobs: recentJobs,
        results: recentResults,
        admitCards: recentAdmitCards
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (Admin only)
router.put('/users/:id/status', [auth, admin], async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('User status update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
