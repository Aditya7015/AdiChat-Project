const cloudinary = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    console.log('🖼️ Upload request received:', {
      hasFile: !!req.file,
      fileSize: req.file?.size,
      mimetype: req.file?.mimetype,
      user: req.user?.username
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('☁️ Uploading to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'adichat',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto'
    });

    console.log('✅ Cloudinary upload successful:', {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image: ' + error.message
    });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage
};