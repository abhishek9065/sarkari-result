const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Transform job data to match frontend expectations
const transformJobData = (job) => {
  const jobObj = job.toObject ? job.toObject() : job;
  return {
    ...jobObj,
    jobType: jobObj.category?.toLowerCase().replace(' jobs', '') || 'other',
    status: jobObj.isActive ? 'active' : 'closed',
    featured: jobObj.isFeatured || false,
    applicationStartDate: jobObj.importantDates?.applicationStartDate,
    applicationEndDate: jobObj.importantDates?.applicationEndDate,
    examDate: jobObj.importantDates?.examDate,
    location: typeof jobObj.location === 'object' ? 
      `${jobObj.location.city || ''}, ${jobObj.location.state || ''}`.replace(/^,\s*|,\s*$/, '') : 
      jobObj.location,
    eligibility: {
      education: jobObj.qualification?.minimum || jobObj.eligibilityCriteria || 'As per notification',
      ageLimit: jobObj.ageLimit ? 
        `${jobObj.ageLimit.minimum || 18}-${jobObj.ageLimit.maximum || 35} years` : 
        'As per notification',
      experience: jobObj.experience ? 
        `${jobObj.experience.minimum || 0}-${jobObj.experience.maximum || 5} years` : 
        'Not specified'
    },
    applicationFee: {
      general: jobObj.applicationFee?.general || 0,
      sc_st: jobObj.applicationFee?.sc || jobObj.applicationFee?.st || 0,
      obc: jobObj.applicationFee?.obc || 0
    },
    applyOnline: jobObj.howToApply?.includes('Online') || true,
    notificationUrl: jobObj.notificationPDF || jobObj.applicationLink || ''
  };
};

// Get all jobs with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('state').optional().trim(),
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
    
    if (req.query.state) {
      filter['location.state'] = new RegExp(req.query.state, 'i');
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sort === 'featured') {
      sort = { isFeatured: -1, createdAt: -1 };
    } else if (req.query.sort === 'deadline') {
      sort = { 'importantDates.applicationEndDate': 1 };
    }

    const jobs = await Job.find(filter)
      .select('-__v')
      .populate('createdBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    // Transform jobs data for frontend compatibility
    const transformedJobs = jobs.map(transformJobData);

    res.json({
      jobs: transformedJobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured jobs
router.get('/featured', async (req, res) => {
  try {
    const featuredJobs = await Job.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .select('-__v')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    const transformedJobs = featuredJobs.map(transformJobData);
    res.json(transformedJobs);
  } catch (error) {
    console.error('Featured jobs fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Job.distinct('category', { isActive: true });
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Job.countDocuments({ category, isActive: true });
        return { name: category, count };
      })
    );

    res.json(categoriesWithCount.sort((a, b) => b.count - a.count));
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Job fetch error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new job (Admin only)
router.post('/', [auth, admin], [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('totalPosts').isInt({ min: 1 }).withMessage('Total posts must be a positive integer'),
  body('howToApply').trim().notEmpty().withMessage('How to apply information is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Job update error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Job deletion error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid job ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;