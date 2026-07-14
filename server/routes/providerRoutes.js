const express = require('express');
const router = express.Router();
const { getProviders, getProvider, createProvider, updateProvider, deleteProvider, verifyProvider, updateProviderStatus, getAnalytics, getMyProvider } = require('../controllers/providerController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', optionalAuth, getProviders);
router.get('/me', verifyToken, requireRole('provider', 'admin'), getMyProvider);
router.get('/:slug', optionalAuth, getProvider);
router.post('/', verifyToken, requireRole('provider', 'admin'), createProvider);
router.put('/:id', verifyToken, requireRole('provider', 'admin'), updateProvider);
router.delete('/:id', verifyToken, requireRole('admin'), deleteProvider);
router.patch('/:id/verify', verifyToken, requireRole('admin'), verifyProvider);
router.patch('/:id/status', verifyToken, requireRole('admin'), updateProviderStatus);
router.get('/:id/analytics', verifyToken, getAnalytics);

module.exports = router;
