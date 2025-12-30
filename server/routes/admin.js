const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth');
const { body, param, validationResult } = require('express-validator');

// helper to send validation errors
function handleValidation(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
	next();
}

// Protected signup - only an authenticated admin can create another admin
router.post('/signup',
	verifyToken,
	body('email').isEmail().withMessage('Invalid email'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	handleValidation,
	adminController.signup
);
router.post('/login',
	body('email').isEmail().withMessage('Invalid email'),
	body('password').exists().withMessage('Missing password'),
	handleValidation,
	adminController.login
);
router.get('/me', verifyToken, adminController.me);

// Admin management endpoints (protected)
router.get('/', verifyToken, adminController.listAdmins);
router.put('/:id',
	verifyToken,
	param('id').isMongoId().withMessage('Invalid admin id'),
	body('email').optional().isEmail().withMessage('Invalid email'),
	body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	handleValidation,
	adminController.updateAdmin
);
router.delete('/:id',
	verifyToken,
	param('id').isMongoId().withMessage('Invalid admin id'),
	handleValidation,
	adminController.deleteAdmin
);

module.exports = router;
