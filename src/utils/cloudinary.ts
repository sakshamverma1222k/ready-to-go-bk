import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath: string) => {
    try {
        if (!filePath) {
            throw new Error('File path is required');
        }
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist');
        }

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto' // Automatically detect file type
        });
        console.log('File uploaded to Cloudinary:', result);
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    } finally {
        // Ensure the local file is deleted after the process
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the file after uploading
            console.log('Local file deleted after upload');
        }
    }
}

const deleteFromCloudinary = async (publicId: string) => {
    try {
        // Delete file from Cloudinary using the public ID
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary:', result);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
