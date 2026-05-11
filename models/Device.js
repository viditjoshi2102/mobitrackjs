const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  ownerPhone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  deviceName: {
    type: String,
    required: [true, 'Device name is required'],
  },
  brand: {
    type: String,
    required: true,
  },
  model: String,
  imeiCode: {
    type: String,
    required: [true, 'IMEI code is required'],
    unique: true,
  },
  serialNumber: String,
  color: String,
  storage: String,
  ram: String,
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  defects: [String],
  purchasePrice: {
    type: Number,
    required: true,
  },
  sellingPrice: Number,
  purchasedDate: {
    type: Date,
    default: Date.now,
  },
  soldDate: Date,
  isSold: {
    type: Boolean,
    default: false,
  },
  images: [{
    url: String,
    publicId: String,
  }],
  notes: String,
  shopkeeperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Create index for search
deviceSchema.index({ 
  deviceName: 'text', 
  brand: 'text', 
  model: 'text',
  imeiCode: 'text',
  ownerName: 'text',
  ownerPhone: 'text'
});

module.exports = mongoose.model('Device', deviceSchema);