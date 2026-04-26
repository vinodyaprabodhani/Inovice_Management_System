const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/dashboard', reportController.getDashboardStats);
router.get('/financial', reportController.getFinancialReport);

module.exports = router;
