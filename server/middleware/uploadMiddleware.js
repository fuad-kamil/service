const multer = require('multer');
const { storage } = require('../config/cloudinary');

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let activeStorage;
if (isCloudinaryConfigured) {
  activeStorage = storage;
} else {
  console.log('⚠️  Cloudinary not configured. Uploads will use Memory Storage / Base64 fallback.');
  activeStorage = multer.memoryStorage();
}

const upload = multer({
  storage: activeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Fallback memory storage (for when Cloudinary is not configured)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

module.exports = { upload, memoryUpload };
