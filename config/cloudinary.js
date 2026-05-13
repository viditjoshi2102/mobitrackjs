const cloudinary = require('cloudinary').v2;
const { URL } = require('url');

const parseCloudinaryUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) {
    return {};
  }

  try {
    const parsed = new URL(cloudinaryUrl);

    if (parsed.protocol !== 'cloudinary:') {
      return {};
    }

    return {
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password),
    };
  } catch (error) {
    console.warn('Invalid CLOUDINARY_URL format');
    return {};
  }
};

const cloudinaryUrlConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

const cloudName =
  cloudinaryUrlConfig.cloud_name ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUD_NAME;
const apiKey =
  cloudinaryUrlConfig.api_key ||
  process.env.CLOUDINARY_API_KEY ||
  process.env.API_KEY;
const apiSecret =
  cloudinaryUrlConfig.api_secret ||
  process.env.CLOUDINARY_API_SECRET ||
  process.env.API_SECRET;

if (cloudName === 'Root') {
  console.warn('Cloudinary cloud name is set to "Root". Use your actual cloud name, not the key label.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

module.exports = cloudinary;
