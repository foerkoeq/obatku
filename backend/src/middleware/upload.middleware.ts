/**
 * Upload Middleware
 * Handles file uploads using Multer with validation and security
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../shared/utils/response.util';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/documents',
    './uploads/images',
    './uploads/qrcodes',
    './uploads/temp'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// File type validation
const allowedMimeTypes = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

const allowedExtensions = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx'],
  spreadsheets: ['.xls', '.xlsx']
};

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Check file size (5MB limit)
    if (file.size && file.size > 5 * 1024 * 1024) {
      return cb(new Error('File size too large. Maximum size is 5MB.'));
    }

    // Check MIME type
    const isValidMimeType = [
      ...allowedMimeTypes.images,
      ...allowedMimeTypes.documents,
      ...allowedMimeTypes.spreadsheets
    ].includes(file.mimetype);

    if (!isValidMimeType) {
      return cb(new Error('Invalid file type. Allowed types: images, PDF, Word, Excel.'));
    }

    // Check file extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isValidExtension = [
      ...allowedExtensions.images,
      ...allowedExtensions.documents,
      ...allowedExtensions.spreadsheets
    ].includes(fileExt);

    if (!isValidExtension) {
      return cb(new Error('Invalid file extension.'));
    }

    cb(null, true);
  } catch (error) {
    cb(new Error('File validation failed.'));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = './uploads';
    
    // Determine upload path based on file type
    if (allowedMimeTypes.images.includes(file.mimetype)) {
      uploadPath = './uploads/images';
    } else if (allowedMimeTypes.documents.includes(file.mimetype)) {
      uploadPath = './uploads/documents';
    } else if (allowedMimeTypes.spreadsheets.includes(file.mimetype)) {
      uploadPath = './uploads/documents';
    }
    
    cb(null, uploadPath);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${fileExt}`;
    
    cb(null, filename);
  }
});

// Multer configuration
const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 10 files
    fields: 20 // Maximum 20 fields
  }
};

// Create multer instance
export const upload = multer(multerConfig);

// Error handling middleware for multer
export const handleUploadError = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return ResponseUtil.error(res, 'FILE_TOO_LARGE', 'File too large. Maximum size is 5MB.', null, 400);
      case 'LIMIT_FILE_COUNT':
        return ResponseUtil.error(res, 'TOO_MANY_FILES', 'Too many files. Maximum is 10 files.', null, 400);
      case 'LIMIT_FIELD_COUNT':
        return ResponseUtil.error(res, 'TOO_MANY_FIELDS', 'Too many fields. Maximum is 20 fields.', null, 400);
      case 'LIMIT_UNEXPECTED_FILE':
        return ResponseUtil.error(res, 'UNEXPECTED_FILE', 'Unexpected file field.', null, 400);
      default:
        return ResponseUtil.error(res, 'FILE_UPLOAD_ERROR', 'File upload error.', null, 400);
    }
  }
  
  if (error.message) {
    return ResponseUtil.error(res, 'FILE_VALIDATION_ERROR', error.message, null, 400);
  }
  
  return ResponseUtil.error(res, 'FILE_UPLOAD_FAILED', 'File upload failed.', null, 400);
};

// Single file upload
export const singleUpload = upload.single('file');

// Multiple files upload
export const multipleUpload = upload.array('files', 10);

// Fields upload (for forms with multiple file fields)
export const fieldsUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'images', maxCount: 10 }
]);

// Custom upload for specific use cases
export const createCustomUpload = (fieldName: string, maxCount: number = 1) => {
  return upload.array(fieldName, maxCount);
};

// Document upload (PDF, Word, Excel)
export const documentUpload = multer({
  ...multerConfig,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      ...allowedMimeTypes.documents,
      ...allowedMimeTypes.spreadsheets
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only documents and spreadsheets are allowed.'));
    }
    
    cb(null, true);
  }
}).array('documents', 5);

// Image upload (JPEG, PNG, GIF, WebP)
export const imageUpload = multer({
  ...multerConfig,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedMimeTypes.images.includes(file.mimetype)) {
      return cb(new Error('Only images are allowed.'));
    }
    
    cb(null, true);
  }
}).array('images', 10);

// QR Code upload (images only)
export const qrCodeUpload = multer({
  ...multerConfig,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedMimeTypes.images.includes(file.mimetype)) {
      return cb(new Error('Only images are allowed for QR codes.'));
    }
    
    cb(null, true);
  }
}).single('qrcode');

// Clean up temporary files
export const cleanupTempFiles = () => {
  const tempDir = './uploads/temp';
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) return;
      
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const now = new Date().getTime();
        const endTime = new Date(stats.mtime).getTime() + (24 * 60 * 60 * 1000); // 24 hours
        
        if (now > endTime) {
          fs.unlinkSync(filePath);
        }
      });
    });
  }
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);
