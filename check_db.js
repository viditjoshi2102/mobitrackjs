const mongoose = require('mongoose');
const Device = require('./models/Device');
require('dotenv').config();

async function checkDevices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const devices = await Device.find({}).limit(10);
    console.log('Devices in DB:', devices.length);
    devices.forEach((device, index) => {
      console.log(`Device ${index + 1}:`);
      console.log(`  ID: ${device._id}`);
      console.log(`  Name: ${device.deviceName}`);
      console.log(`  IMEI: ${device.imeiCode}`);
      console.log(`  Images: ${device.images.length}`);
      if (device.images.length > 0) {
        device.images.forEach((img, i) => {
          console.log(`    Image ${i + 1}: ${img.url}`);
        });
      }
      console.log('---');
    });

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDevices();