const cloudinary = require('cloudinary').v2;

/**
 * Upload Base64 image to Cloudinary and return the secure HTTPS URL
 */
const uploadBase64Image = async (base64String) => {
  if (!base64String) return null;
  
  try {
    // By default, Cloudinary uses the CLOUDINARY_URL set in the .env file.
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: "specforge_triage",
      resource_type: "image",
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

module.exports = { uploadBase64Image };
