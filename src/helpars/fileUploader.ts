import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, path.join( "/var/www/uploads"));
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB limit
  },
});

// upload single image
const uploadProfilePicture = upload.single('profilePicture');

const uploadSingleImage = upload.single('image');
const uploadThumbnail = upload.single('thumbnail');

// upload multiple image
const uploadMultipleMedia = upload.fields([
  { name: 'logo', maxCount: 10 },
  { name: 'images', maxCount: 10 },
]);

const uploadMultipleImages = upload.array('images', 10);

export const fileUploader = {
  upload,
  uploadMultipleMedia,
  uploadProfilePicture,
  uploadSingleImage,
  uploadMultipleImages,
  uploadThumbnail
};
