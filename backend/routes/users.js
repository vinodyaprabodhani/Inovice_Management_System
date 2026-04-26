const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);

router.get('/organization', userController.getOrgUsers);
router.post('/invite', userController.createUser);
router.put('/profile', userController.updateProfile);
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;
