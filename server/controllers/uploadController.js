const { cloudinary } = require('../config/cloudinary');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    if (req.file.buffer) {
      const base64Image = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
      return res.json({ success: true, url: dataUrl, publicId: 'mock_local_upload_' + Date.now() });
    }

    res.json({ success: true, url: req.file.path, publicId: req.file.filename });
  } catch (error) { next(error); }
};

const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ success: false, message: 'Public ID required' });
    
    if (publicId.startsWith('mock_local_upload_')) {
      return res.json({ success: true, message: 'Image deleted' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) { next(error); }
};

module.exports = { uploadImage, deleteImage };
