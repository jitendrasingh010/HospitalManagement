const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqfhn7rw3',
    api_key: process.env.CLOUDINARY_API_KEY || '382695276612379',
    api_secret: process.env.CLOUDINARY_API_SECRET || '3XWIpGNiRSe2K2Cs2t9-fUtPPY0'
});

const uploadImage = async (image) => {
    if (!image) {
        return '';
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }

    const result = await cloudinary.uploader.upload(image, {
        folder: 'hospital_management/profile'
    });

    return result.secure_url;
};

module.exports = { uploadImage };
