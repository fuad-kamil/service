const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  open: { type: String, default: '08:00' },
  close: { type: String, default: '17:00' },
  closed: { type: Boolean, default: false },
});

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerType: {
      type: String,
      enum: ['hospital', 'clinic', 'diagnostic_center', 'individual', 'institute', 'company', 'other'],
      required: [true, 'Provider type is required'],
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    logo: { type: String, default: null },
    photos: [{ type: String }],
    address: {
      street: { type: String },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String },
      country: { type: String, default: 'Ethiopia' },
      postalCode: { type: String },
    },
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    contactInfo: {
      phone: { type: String },
      email: { type: String },
      website: { type: String },
    },
    workingHours: {
      monday: { type: workingHoursSchema, default: () => ({}) },
      tuesday: { type: workingHoursSchema, default: () => ({}) },
      wednesday: { type: workingHoursSchema, default: () => ({}) },
      thursday: { type: workingHoursSchema, default: () => ({}) },
      friday: { type: workingHoursSchema, default: () => ({}) },
      saturday: { type: workingHoursSchema, default: () => ({ closed: true }) },
      sunday: { type: workingHoursSchema, default: () => ({ closed: true }) },
    },
    // Institution-specific
    specialties: [{ type: String }],
    licenseNumber: { type: String },
    // Individual-specific
    profession: { type: String },
    yearsOfExperience: { type: Number },
    certifications: [{ type: String }],
    serviceAreaRadius: { type: Number, default: 10 }, // km
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
    },
    profileViews: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial index
providerSchema.index({ geoLocation: '2dsphere' });
providerSchema.index({ businessName: 'text', description: 'text', specialties: 'text' });

module.exports = mongoose.model('Provider', providerSchema);
