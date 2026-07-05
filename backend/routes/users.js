const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + req.userId + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(verifyToken);

router.get('/organization', userController.getOrgUsers);
router.post('/invite', userController.createUser);
router.put('/profile', upload.single('avatar'), userController.updateProfile);
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;
