const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes (Client Portal)
router.get('/portal/:token', invoiceController.getByToken);

// Protected routes
router.use(verifyToken);
router.post('/', invoiceController.create);
router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.put('/:id', invoiceController.update);
router.delete('/:id', isAdmin, invoiceController.delete);
router.get('/:id/pdf', invoiceController.generatePDF);

module.exports = router;
