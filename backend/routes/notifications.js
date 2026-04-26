const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/whatsapp/test', notifController.testWhatsApp);
router.post('/whatsapp/invoice/:invoiceId', notifController.sendWhatsAppInvoice);
router.post('/email/invoice/:invoiceId', notifController.sendEmailInvoice);

router.post('/remind/:invoiceId', notifController.triggerPaymentReminder);
router.post('/overdue/:invoiceId', notifController.triggerOverdueNotice);

module.exports = router;
