/**
 * Upload controller — handles file uploads via multer.
 * Files are stored in /uploads/properties/ and URLs are returned.
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter — images only
const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, AVIF) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload
 * @access  Private/Admin
 */
const uploadImages = (req, res, next) => {
  const uploader = upload.array('images', 10);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large. Max 5 MB per image.'
          : err.message,
      });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = req.files.map((file) => ({
      url: `${baseUrl}/uploads/properties/${file.filename}`,
      alt: file.originalname,
    }));

    res.json({ success: true, data: images });
  });
};

module.exports = { uploadImages };
