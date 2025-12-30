const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const { upload } = require('../middlewares/upload');
const { body, validationResult } = require('express-validator');

function validateListing(req, res, next) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
	next();
}

// Map multer's `req.files` (array from `upload.any()`) into an object
// where keys are fieldnames and values are arrays - matching what
// `upload.fields()` normally produces. This keeps controller code unchanged.
function mapFilesMiddleware(req, res, next) {
	if (!req.files || !Array.isArray(req.files)) return next();
	const filesByField = {};
	req.files.forEach((f) => {
		if (!filesByField[f.fieldname]) filesByField[f.fieldname] = [];
		filesByField[f.fieldname].push(f);
	});
	req.files = filesByField;
	next();
}

router.get('/', listingsController.list);
router.get('/:id', listingsController.get);
router.post(
	'/',
	upload.any(),
	mapFilesMiddleware,
	// validations
	body('title').optional().isString().isLength({ min: 1 }),
	body('price').optional().isNumeric(),
	body('beds').optional().isInt({ min: 0 }),
	body('baths').optional().isInt({ min: 0 }),
	body('status').optional().isIn(['active', 'under-contract', 'sold']),
	validateListing,
	listingsController.create
);

router.put(
	'/:id',
	upload.any(),
	mapFilesMiddleware,
	body('title').optional().isString().isLength({ min: 1 }),
	body('price').optional().isNumeric(),
	body('beds').optional().isInt({ min: 0 }),
	body('baths').optional().isInt({ min: 0 }),
	body('status').optional().isIn(['active', 'under-contract', 'sold']),
	validateListing,
	listingsController.update
);
router.delete('/:id', listingsController.remove);

module.exports = router;
