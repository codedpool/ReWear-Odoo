const express = require('express');
const router = express.Router();
const { getPendingItems, approveItem, rejectItem, removeItem } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');

router.get('/items/pending', protect, adminProtect, getPendingItems);
router.patch('/items/:id/approve', protect, adminProtect, approveItem);
router.patch('/items/:id/reject', protect, adminProtect, rejectItem);
router.delete('/items/:id', protect, adminProtect, removeItem);

module.exports = router;