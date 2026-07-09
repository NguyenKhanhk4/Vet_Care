const multer = require('multer');
const path = require('path');

/**
 * Multer Upload Middleware
 * Handles file uploads for avatars and pet images
 * Stores files in the uploads/ directory
 */

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp.extension
    const uniqueName = `${req.user?._id || 'unknown'}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter - only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, and .gif files are allowed'), false);
  }
};

// Multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

// Export specific upload handlers
module.exports = {
  uploadSingle: upload.single('image'),      // Single image upload
  uploadAvatar: upload.single('avatar'),      // Avatar upload
  uploadMultiple: upload.array('images', 5),  // Multiple images (max 5)
};
