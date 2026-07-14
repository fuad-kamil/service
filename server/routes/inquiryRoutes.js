const express = require('express');
const router = express.Router();
const { createInquiry, getUserInquiries, getProviderInquiries, replyToInquiry, updateInquiryStatus } = require('../controllers/inquiryController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', verifyToken, requireRole('user', 'admin'), createInquiry);
router.get('/user', verifyToken, getUserInquiries);
router.get('/provider', verifyToken, requireRole('provider', 'admin'), getProviderInquiries);
router.put('/:id/reply', verifyToken, replyToInquiry);
router.patch('/:id/status', verifyToken, requireRole('provider', 'admin'), updateInquiryStatus);

module.exports = router;
