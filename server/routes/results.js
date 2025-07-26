const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get all results with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('resultType').optional().trim(),
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
    
    if (req.query.resultType) {
      filter.resultType = req.query.resultType;
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = { resultDate: -1 };
    if (req.query.sort === 'featured') {
      sort = { isFeatured: -1, resultDate: -1 };
    }

    const results = await Result.find(filter)
      .select('-__v')
      .populate('createdBy', 'name')
      .populate('relatedJob', 'title organization')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Result.countDocuments(filter);

    res.json({
      results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured results
router.get('/featured', async (req, res) => {
  try {
    const featuredResults = await Result.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .select('-__v')
    .populate('createdBy', 'name')
    .populate('relatedJob', 'title organization')
    .sort({ resultDate: -1 })
    .limit(10);

    res.json(featuredResults);
  } catch (error) {
    console.error('Featured results fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get result categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Result.distinct('category', { isActive: true });
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Result.countDocuments({ category, isActive: true });
        return { name: category, count };
      })
    );

    res.json(categoriesWithCount.sort((a, b) => b.count - a.count));
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get latest results
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const latestResults = await Result.find({ isActive: true })
      .select('title organization examName resultDate category')
      .sort({ resultDate: -1 })
      .limit(limit);

    res.json(latestResults);
  } catch (error) {
    console.error('Latest results fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single result by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('relatedJob', 'title organization');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Increment view count
    result.views += 1;
    await result.save();

    res.json(result);
  } catch (error) {
    console.error('Result fetch error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid result ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new result (Admin only)
router.post('/', [auth, admin], [
  body('title').trim().notEmpty().withMessage('Result title is required'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('examName').trim().notEmpty().withMessage('Exam name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('resultType').notEmpty().withMessage('Result type is required'),
  body('resultDate').isISO8601().withMessage('Valid result date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resultData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const result = new Result(resultData);
    await result.save();

    res.status(201).json({
      message: 'Result created successfully',
      result
    });
  } catch (error) {
    console.error('Result creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update result (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({
      message: 'Result updated successfully',
      result
    });
  } catch (error) {
    console.error('Result update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid result ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete result (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Result deletion error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid result ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
