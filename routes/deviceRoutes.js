const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  addDevice,
  getAllDevices,
  searchDevices,
  getDeviceById,
  updateDevice,
  markAsSold,
  deleteDevice,
} = require('../controllers/devicecontrollers');

router.use(protect); // All routes require authentication

router.post('/', upload.array('images', 5), addDevice);
router.get('/', getAllDevices);
router.get('/search', searchDevices);
router.get('/:id', getDeviceById);
router.put('/:id', updateDevice);
router.put('/:id/sold', markAsSold);
router.delete('/:id', deleteDevice);

module.exports = router;