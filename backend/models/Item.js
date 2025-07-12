const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'] 
  },
  type: { type: String, required: true, trim: true },
  size: { type: String, required: true },
  condition: { 
    type: String, 
    required: true, 
    enum: ['new', 'like-new', 'good', 'fair'] 
  },
  tags: [{ type: String, trim: true }],
  images: [{ type: String }],
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: { type: String, required: true },
  uploaderAvatar: { type: String },
  pointValue: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }, // Added for admin approval
  uploadDate: { type: Date, default: Date.now },
  location: { type: String }
}, {
  timestamps: true
});

// Add text index on title and description for search functionality
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);