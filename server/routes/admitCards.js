const express = require('express');
const { body, validationResult, query } = require('express-validator');
const AdmitCard = require('../models/AdmitCard');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get all admit cards with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = { releaseDate: -1 };
    if (req.query.sort === 'featured') {
      sort = { isFeatured: -1, releaseDate: -1 };
    } else if (req.query.sort === 'examDate') {
      sort = { examDate: 1 };
    }

    const admitCards = await AdmitCard.find(filter)
      .select('-__v')
      .populate('createdBy', 'name')
      .populate('relatedJob', 'title organization')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await AdmitCard.countDocuments(filter);

    res.json({
      admitCards,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAdmitCards: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Admit cards fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured admit cards
router.get('/featured', async (req, res) => {
  try {
    const featuredAdmitCards = await AdmitCard.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .select('-__v')
    .populate('createdBy', 'name')
    .populate('relatedJob', 'title organization')
    .sort({ releaseDate: -1 })
    .limit(10);

    res.json(featuredAdmitCards);
  } catch (error) {
    console.error('Featured admit cards fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admit card categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await AdmitCard.distinct('category', { isActive: true });
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await AdmitCard.countDocuments({ category, isActive: true });
        return { name: category, count };
      })
    );

    res.json(categoriesWithCount.sort((a, b) => b.count - a.count));
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest admit cards
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const latestAdmitCards = await AdmitCard.find({ isActive: true })
      .select('title organization examName examDate releaseDate category')
      .sort({ releaseDate: -1 })
      .limit(limit);

    res.json(latestAdmitCards);
  } catch (error) {
    console.error('Latest admit cards fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single admit card by ID
router.get('/:id', async (req, res) => {
  try {
    const admitCard = await AdmitCard.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('relatedJob', 'title organization');

    if (!admitCard) {
      return res.status(404).json({ message: 'Admit card not found' });
    }

    // Increment view count
    admitCard.views += 1;
    await admitCard.save();

    res.json(admitCard);
  } catch (error) {
    console.error('Admit card fetch error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid admit card ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new admit card (Admin only)
router.post('/', [auth, admin], [
  body('title').trim().notEmpty().withMessage('Admit card title is required'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('examName').trim().notEmpty().withMessage('Exam name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const admitCardData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const admitCard = new AdmitCard(admitCardData);
    await admitCard.save();

    res.status(201).json({
      message: 'Admit card created successfully',
      admitCard
    });
  } catch (error) {
    console.error('Admit card creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admit card (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const admitCard = await AdmitCard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!admitCard) {
      return res.status(404).json({ message: 'Admit card not found' });
    }

    res.json({
      message: 'Admit card updated successfully',
      admitCard
    });
  } catch (error) {
    console.error('Admit card update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid admit card ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete admit card (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const admitCard = await AdmitCard.findByIdAndDelete(req.params.id);

    if (!admitCard) {
      return res.status(404).json({ message: 'Admit card not found' });
    }

    res.json({ message: 'Admit card deleted successfully' });
  } catch (error) {
    console.error('Admit card deletion error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid admit card ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
