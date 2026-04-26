const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizationController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

router.use(verifyToken);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/logos'));
  },
  filename: (req, file, cb) => {
    cb(null, 'logo-' + req.organizationId + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', orgController.getSettings);
router.put('/', isAdmin, upload.single('logo'), orgController.updateSettings);

router.get('/whatsapp', orgController.getWhatsAppConfig);
router.put('/whatsapp', isAdmin, orgController.updateWhatsAppConfig);

module.exports = router;
