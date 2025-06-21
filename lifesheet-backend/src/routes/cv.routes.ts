import express from 'express';
import { 
  createCV, 
  getCVs, 
  getCV, 
  updateCV, 
  deleteCV, 
  tailorCV,
  uploadCVAttachment
} from '../controllers/cv.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractUserFromToken, jwtCheck } from '../middleware/auth0.middleware';

const router = express.Router();
router.use([jwtCheck, extractUserFromToken]);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    cb(
      null, 
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /pdf|doc|docx|jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and image files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// All routes are already protected by Auth0 middleware in index.ts
// No need to use protect middleware here

// CV routes
router.route('/')
  .post(createCV)
  .get(getCVs);

router.route('/:id')
  .get(getCV)
  .put(updateCV)
  .delete(deleteCV);

// Tailor CV
router.post('/:id/tailor',tailorCV);

// Upload attachment
router.post('/:id/upload', upload.single('attachment'), uploadCVAttachment);
  
export default router;
