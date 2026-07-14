const express = require('express');
const router = express.Router();
const { getSavedProviders, saveProvider, unsaveProvider, getAllUsers, updateUserRole, deleteUser, updateProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/saved', verifyToken, getSavedProviders);
router.post('/saved/:providerId', verifyToken, saveProvider);
router.delete('/saved/:providerId', verifyToken, unsaveProvider);
router.put('/profile', verifyToken, updateProfile);
router.get('/', verifyToken, requireRole('admin'), getAllUsers);
router.patch('/:id/role', verifyToken, requireRole('admin'), updateUserRole);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

module.exports = router;
