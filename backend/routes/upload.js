const express = require('express');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { uploadSingle } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/image', authenticate, uploadSingle, uploadImage);
router.delete('/image/:publicId', authenticate, deleteImage);

module.exports = router;