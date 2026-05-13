const Device = require('../models/Device');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

// Add new device
exports.addDevice = async (req, res) => {
  try {
    const deviceData = req.body;
    
    // Check if IMEI already exists
    const existingDevice = await Device.findOne({ imeiCode: deviceData.imeiCode });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device with this IMEI already exists' });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file, 'old-mobile-devices');
        imageUrls.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    const device = new Device({
      ...deviceData,
      images: imageUrls,
      shopkeeperId: req.user._id,
      purchasedDate: deviceData.purchasedDate || Date.now(),
    });

    await device.save();
    res.status(201).json({ success: true, data: device });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find({ shopkeeperId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search devices
exports.searchDevices = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({ success: true, data: [] });
    }

    const devices = await Device.find({
      shopkeeperId: req.user._id,
      $or: [
        { deviceName: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { imeiCode: { $regex: query, $options: 'i' } },
        { ownerName: { $regex: query, $options: 'i' } },
        { ownerPhone: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: devices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single device
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      shopkeeperId: req.user._id,
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, shopkeeperId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as sold
exports.markAsSold = async (req, res) => {
  try {
    const { sellingPrice, soldDate } = req.body;
    
    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, shopkeeperId: req.user._id },
      {
        isSold: true,
        sellingPrice: sellingPrice,
        soldDate: soldDate || Date.now(),
      },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json({ success: true, data: device });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      shopkeeperId: req.user._id,
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    // Delete images from Cloudinary
    for (const image of device.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    
    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
