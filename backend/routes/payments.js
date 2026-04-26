const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// Public portal payment
router.post('/process/:token', paymentController.processPortalPayment);

// Protected routes
router.use(verifyToken);
router.get('/all', paymentController.getAll);
router.post('/', paymentController.recordPayment);
router.get('/invoice/:id', paymentController.getByInvoice);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
