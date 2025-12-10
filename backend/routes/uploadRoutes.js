const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        // Replace spaces with underscores and append timestamp
        const cleanName = file.originalname.replace(/\s+/g, '_');
        cb(null, path.basename(cleanName, path.extname(cleanName)) + '-' + Date.now() + path.extname(cleanName));
    }
});

// File Filter
const fileFilter = (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|webp|gif|mp4|mkv|mov|avi|webm/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Media Files Only (Images & Video)!');
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: fileFilter
}).single('file'); // 'file' is the field name

// Upload Endpoint
router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ msg: 'File too large. Max 500MB.' });
            }
            return res.status(400).json({ msg: err });
        } else {
            if(req.file == undefined){
                return res.status(400).json({ msg: 'No file selected!' });
            } else {
                // Construct URL
                // Assuming server runs on localhost:5000 or production domain
                // We'll return a relative path or full URL based on env, but for now relative is safer for frontend to proxy or prepend
                const fileUrl = `/uploads/${req.file.filename}`;
                
                res.json({
                    msg: 'File Uploaded!',
                    file: fileUrl,
                    path: req.file.path,
                    filename: req.file.filename
                });
            }
        }
    });
});

module.exports = router;
