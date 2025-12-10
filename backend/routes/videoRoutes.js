const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const videoController = require('../controllers/videoController');

// Ensure temp upload directory exists
const uploadDir = path.join(__dirname, '..', 'temp', 'uploads');
fs.ensureDirSync(uploadDir);

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const { optionalProtect } = require('../middleware/authMiddleware');

// Routes
router.post('/upload', upload.single('video'), videoController.uploadVideo);
router.get('/url/:contentId', optionalProtect, videoController.getVideoUrl);

module.exports = router;
