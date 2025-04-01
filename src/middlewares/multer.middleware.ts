import multer from 'multer';
import type { Request } from 'express'; // Use type-only import for Request
import type { StorageEngine } from 'multer'; // Use type-only import for StorageEngine


// Configure the storage engine for multer
const storage: StorageEngine = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
        // Save files to the './public/temp' directory
        cb(null, './public/temp');
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
        // Generate a unique file name using the current timestamp and a random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

// File size and type limits configuration for multer
const upload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 50 * 1024 * 1024, // 50 MB file size limit
    // },
    // fileFilter: function (req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    //     const filetypes = /jpeg|jpg|png|gif|pdf/; // Allowed file types (images and PDFs)
    //     const mimetype = filetypes.test(file.mimetype);  // Check MIME type
    //     const extname = filetypes.test(file.originalname.toLowerCase()); // Check file extension

    //     if (mimetype && extname) {
    //         return cb(null, true);  // Accept the file
    //     }
    //     cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));  // Reject the file
    // }
});

// Export the middleware to be used in your routes
export const multerMiddleware = upload;
