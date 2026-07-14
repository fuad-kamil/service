const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post('/image', verifyToken, upload.single('image'), uploadImage);
router.delete('/image', verifyToken, deleteImage);

module.exports = router;
