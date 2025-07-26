const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Result title is required'],
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
      'Railway Results',
      'Bank Results',
      'SSC Results',
      'UPSC Results',
      'State Govt Results',
      'Central Govt Results',
      'Police Results',
      'Teaching Results',
      'Defense Results',
      'PSU Results',
      'Court Results',
      'Other Results'
    ]
  },
  resultType: {
    type: String,
    enum: ['Written Exam', 'Interview', 'Physical Test', 'Medical Test', 'Final Merit List', 'Cut Off', 'Answer Key'],
    required: true
  },
  examDate: Date,
  resultDate: {
    type: Date,
    required: true
  },
  totalCandidates: Number,
  selectedCandidates: Number,
  cutOffMarks: [{
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS']
    },
    marks: Number,
    percentage: Number
  }],
  resultPDF: String,
  officialWebsite: String,
  resultLink: String,
  instructions: String,
  description: String,
  nextStepInfo: String,
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
resultSchema.index({ title: 'text', organization: 'text', examName: 'text' });
resultSchema.index({ category: 1 });
resultSchema.index({ resultType: 1 });
resultSchema.index({ resultDate: -1 });
resultSchema.index({ isActive: 1 });
resultSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Result', resultSchema);
