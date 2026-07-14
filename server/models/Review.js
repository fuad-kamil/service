const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per provider
reviewSchema.index({ userId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
