const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Admit card title is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  examName: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Railway Admit Cards',
      'Bank Admit Cards',
      'SSC Admit Cards',
      'UPSC Admit Cards',
      'State Govt Admit Cards',
      'Central Govt Admit Cards',
      'Police Admit Cards',
      'Teaching Admit Cards',
      'Defense Admit Cards',
      'PSU Admit Cards',
      'Court Admit Cards',
      'Other Admit Cards'
    ]
  },
  examDate: {
    type: Date,
    required: true
  },
  examTime: String,
  examDuration: String,
  releaseDate: Date,
  lastDateToDownload: Date,
  downloadLink: String,
  officialWebsite: String,
  loginCredentials: {
    required: [String], // e.g., ['Registration Number', 'Date of Birth']
    format: String
  },
  examCenters: [String],
  importantInstructions: [String],
  documentsRequired: [String],
  contactInfo: {
    helplineNumber: String,
    email: String,
    address: String
  },
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
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
    required: true
  }
}, {
  timestamps: true
});

// Indexing for better search performance
admitCardSchema.index({ title: 'text', organization: 'text', examName: 'text' });
admitCardSchema.index({ category: 1 });
admitCardSchema.index({ examDate: 1 });
admitCardSchema.index({ releaseDate: -1 });
admitCardSchema.index({ isActive: 1 });
admitCardSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('AdmitCard', admitCardSchema);
