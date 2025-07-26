const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Railway Jobs',
      'Bank Jobs',
      'SSC Jobs',
      'UPSC Jobs',
      'State Govt Jobs',
      'Central Govt Jobs',
      'Police Jobs',
      'Teaching Jobs',
      'Defense Jobs',
      'PSU Jobs',
      'Court Jobs',
      'Other Jobs'
    ]
  },
  type: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract', 'Temporary'],
    default: 'Full Time'
  },
  qualification: {
    minimum: String,
    preferred: String
  },
  experience: {
    minimum: Number,
    maximum: Number
  },
  ageLimit: {
    minimum: Number,
    maximum: Number,
    relaxation: {
      obc: Number,
      sc: Number,
      st: Number
    }
  },
  salary: {
    minimum: Number,
    maximum: Number,
    currency: { type: String, default: 'INR' }
  },
  location: {
    state: String,
    city: String,
    district: String
  },
  totalPosts: {
    type: Number,
    required: true
  },
  postDetails: [{
    postName: String,
    numberOfPosts: Number,
    reservation: {
      general: Number,
      obc: Number,
      sc: Number,
      st: Number,
      ews: Number
    }
  }],
  applicationFee: {
    general: Number,
    obc: Number,
    sc: Number,
    st: Number,
    ews: Number
  },
  importantDates: {
    notificationDate: Date,
    applicationStartDate: Date,
    applicationEndDate: Date,
    examDate: Date,
    resultDate: Date
  },
  examDetails: {
    examPattern: String,
    syllabus: String,
    examMode: {
      type: String,
      enum: ['Online', 'Offline', 'Both']
    }
  },
  howToApply: {
    type: String,
    required: true
  },
  officialWebsite: String,
  notificationPDF: String,
  applicationLink: String,
  description: String,
  eligibilityCriteria: String,
  selectionProcess: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexing for better search performance
jobSchema.index({ title: 'text', organization: 'text', category: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ 'location.state': 1 });
jobSchema.index({ 'importantDates.applicationEndDate': 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Job', jobSchema);
