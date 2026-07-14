require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');


const categories = [
  // Healthcare
  { name: 'Laboratory Tests', slug: 'laboratory-tests', icon: '🧪', applicableProviderTypes: ['hospital', 'clinic', 'diagnostic_center'], sortOrder: 1 },
  { name: 'Radiology & Imaging', slug: 'radiology-imaging', icon: '🩻', applicableProviderTypes: ['hospital', 'clinic', 'diagnostic_center'], sortOrder: 2 },
  { name: 'Surgery', slug: 'surgery', icon: '⚕️', applicableProviderTypes: ['hospital', 'clinic'], sortOrder: 3 },
  { name: 'Consultation', slug: 'consultation', icon: '👨‍⚕️', applicableProviderTypes: ['hospital', 'clinic'], sortOrder: 4 },
  { name: 'Dental', slug: 'dental', icon: '🦷', applicableProviderTypes: ['hospital', 'clinic'], sortOrder: 5 },
  { name: 'Physiotherapy', slug: 'physiotherapy', icon: '💪', applicableProviderTypes: ['hospital', 'clinic', 'individual'], sortOrder: 6 },
  // Trades
  { name: 'Plumbing', slug: 'plumbing', icon: '🔧', applicableProviderTypes: ['individual', 'company'], sortOrder: 7 },
  { name: 'Electrical', slug: 'electrical', icon: '⚡', applicableProviderTypes: ['individual', 'company'], sortOrder: 8 },
  { name: 'HVAC & Cooling', slug: 'hvac-cooling', icon: '❄️', applicableProviderTypes: ['individual', 'company'], sortOrder: 9 },
  { name: 'Carpentry', slug: 'carpentry', icon: '🪚', applicableProviderTypes: ['individual', 'company'], sortOrder: 10 },
  { name: 'Painting', slug: 'painting', icon: '🎨', applicableProviderTypes: ['individual', 'company'], sortOrder: 11 },
  // Education
  { name: 'Tutoring', slug: 'tutoring', icon: '📚', applicableProviderTypes: ['individual', 'institute'], sortOrder: 12 },
  { name: 'Courses & Certifications', slug: 'courses-certifications', icon: '🎓', applicableProviderTypes: ['institute', 'individual'], sortOrder: 13 },
  { name: 'Language Training', slug: 'language-training', icon: '🗣️', applicableProviderTypes: ['institute', 'individual'], sortOrder: 14 },
  // Construction
  { name: 'Construction', slug: 'construction', icon: '🏗️', applicableProviderTypes: ['company'], sortOrder: 15 },
  { name: 'Interior Design', slug: 'interior-design', icon: '🛋️', applicableProviderTypes: ['individual', 'company'], sortOrder: 16 },
  // Auto
  { name: 'Auto Repair', slug: 'auto-repair', icon: '🚗', applicableProviderTypes: ['individual', 'company'], sortOrder: 17 },
  // Cleaning
  { name: 'Cleaning Services', slug: 'cleaning-services', icon: '🧹', applicableProviderTypes: ['individual', 'company'], sortOrder: 18 },
  // IT
  { name: 'IT & Tech Support', slug: 'it-tech-support', icon: '💻', applicableProviderTypes: ['individual', 'company'], sortOrder: 19 },
  // Legal / Finance
  { name: 'Legal Services', slug: 'legal-services', icon: '⚖️', applicableProviderTypes: ['individual', 'company'], sortOrder: 20 },
  { name: 'Accounting & Finance', slug: 'accounting-finance', icon: '💰', applicableProviderTypes: ['individual', 'company'], sortOrder: 21 },
];



const seed = async () => {
  await connectDB();

  const User = require('../models/User');
  const Category = require('../models/Category');
  const Provider = require('../models/Provider');
  const Service = require('../models/Service');

  console.log('[SEED] Seeding database...');

  // Safe index drop to avoid duplicate key or index conflicts on Atlas
  for (const model of [User, Category, Provider, Service]) {
    if (model.collection && typeof model.collection.dropIndexes === 'function') {
      try {
        await model.collection.dropIndexes();
        console.log(`[SEED] Dropped indexes for collection: ${model.collection.name}`);
      } catch (e) {
        // Safe to ignore if collection doesn't exist yet or has no indexes to drop
      }
    }
  }

  // Clear existing
  await User.deleteMany({});
  await Category.deleteMany({});
  await Provider.deleteMany({});
  await Service.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@servicehub.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
  });
  console.log(`[SEED] Admin created: ${admin.email}`);

  // Create categories
  const createdCategories = await Category.insertMany(categories);
  console.log(`[SEED] ${createdCategories.length} categories seeded`);

  // Create sample provider user
  const providerUser = await User.create({
    name: 'City General Hospital',
    email: 'hospital@demo.com',
    password: 'Demo@123456',
    role: 'provider',
  });

  // Create sample provider
  const provider = await Provider.create({
    userId: providerUser._id,
    providerType: 'hospital',
    businessName: 'City General Hospital',
    slug: 'city-general-hospital',
    description: 'A leading multi-specialty hospital providing comprehensive healthcare services with state-of-the-art equipment and experienced medical professionals.',
    address: { street: '123 Health Ave', city: 'Addis Ababa', country: 'Ethiopia' },
    geoLocation: { type: 'Point', coordinates: [38.7578, 9.0254] },
    contactInfo: { phone: '+251-11-123-4567', email: 'info@cityhospital.com' },
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Radiology'],
    verified: true,
    status: 'active',
    averageRating: 4.5,
    reviewCount: 120,
  });

  // Create sample services
  const labCat = createdCategories.find(c => c.slug === 'laboratory-tests');
  const imagingCat = createdCategories.find(c => c.slug === 'radiology-imaging');
  const consultCat = createdCategories.find(c => c.slug === 'consultation');

  await Service.insertMany([
    { providerId: provider._id, categoryId: labCat._id, subcategory: 'Blood Tests', name: 'Complete Blood Count (CBC)', description: 'Comprehensive blood analysis including RBC, WBC, platelets', price: 250, priceType: 'fixed', currency: 'ETB', duration: '24 hours' },
    { providerId: provider._id, categoryId: labCat._id, subcategory: 'Blood Tests', name: 'Liver Function Test (LFT)', description: 'Tests to measure liver enzyme levels', price: 450, priceType: 'fixed', currency: 'ETB', duration: '24 hours' },
    { providerId: provider._id, categoryId: labCat._id, subcategory: 'Blood Tests', name: 'Blood Sugar (Fasting & Random)', description: 'Measures blood glucose levels', price: 150, priceType: 'fixed', currency: 'ETB', duration: '2 hours' },
    { providerId: provider._id, categoryId: imagingCat._id, subcategory: 'Ultrasound', name: 'Abdominal Ultrasound', description: 'Ultrasound imaging of abdominal organs', price: 800, priceType: 'fixed', currency: 'ETB', duration: '30 minutes' },
    { providerId: provider._id, categoryId: imagingCat._id, subcategory: 'CT Scan', name: 'CT Scan — Brain', description: 'Computed tomography of the brain', price: 3500, priceType: 'fixed', currency: 'ETB', duration: '1 hour' },
    { providerId: provider._id, categoryId: imagingCat._id, subcategory: 'MRI', name: 'MRI — Brain', description: 'Magnetic resonance imaging of the brain', price: 6500, priceType: 'fixed', currency: 'ETB', duration: '1.5 hours' },
    { providerId: provider._id, categoryId: consultCat._id, subcategory: 'Specialist', name: 'Cardiologist Consultation', description: 'Specialist consultation with cardiologist', price: 600, priceType: 'fixed', currency: 'ETB', duration: '30 minutes' },
  ]);

  console.log('[SEED] Sample provider and services created');
  console.log('\n[SEED] Seed complete!');
  console.log('Admin:', process.env.ADMIN_EMAIL || 'admin@servicehub.com');
  console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123456');
  console.log('Demo Provider: hospital@demo.com / Demo@123456');
  process.exit(0);
};

seed().catch((err) => {
  console.error('[SEED] Seed failed:', err);
  process.exit(1);
});
