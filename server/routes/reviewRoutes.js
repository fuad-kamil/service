const express = require('express');
const router = express.Router();
const { getProviderReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/provider/:providerId', getProviderReviews);
router.post('/', verifyToken, requireRole('user', 'admin'), createReview);
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;
