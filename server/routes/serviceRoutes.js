const express = require('express');
const router = express.Router();
const { getServices, getServicesByProvider, getService, createService, updateService, deleteService } = require('../controllers/serviceController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', getServices);
router.get('/provider/:providerId', getServicesByProvider);
router.get('/:id', getService);
router.post('/', verifyToken, requireRole('provider', 'admin'), createService);
router.put('/:id', verifyToken, requireRole('provider', 'admin'), updateService);
router.delete('/:id', verifyToken, requireRole('provider', 'admin'), deleteService);

module.exports = router;
