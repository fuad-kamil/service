const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    icon: { type: String, default: '🏷️' },
    description: { type: String },
    applicableProviderTypes: [
      {
        type: String,
        enum: ['hospital', 'clinic', 'diagnostic_center', 'individual', 'institute', 'company', 'other'],
      },
    ],
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
