const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: { type: String, trim: true },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    priceMax: { type: Number, default: null },
    priceType: {
      type: String,
      enum: ['fixed', 'range', 'per_hour', 'per_sqm', 'on_request'],
      default: 'fixed',
    },
    currency: { type: String, default: 'USD' },
    duration: { type: String }, // e.g. "30 minutes", "2-3 days"
    availability: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 'text', description: 'text', subcategory: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
