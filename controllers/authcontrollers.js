const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register - WITH next parameter
exports.register = async (req, res, next) => {
  try {
    console.log('[AUTH REGISTER] Request received at:', new Date().toISOString());
    console.log('[AUTH REGISTER] Body:', req.body);
    
    const { name, email, password, shopName, phone } = req.body || {};

    // Validation
    if (!name || !email || !password) {
      console.log('[AUTH REGISTER] Validation failed - missing fields');
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('[AUTH REGISTER] User already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create user
    console.log('[AUTH REGISTER] Creating new user:', email);
    const user = await User.create({
      name,
      email,
      password,
      shopName: shopName || '',
      phone: phone || '',
    });

    console.log('[AUTH REGISTER] User created successfully:', user._id);
    // Send response
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
        phone: user.phone,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('[AUTH REGISTER] Error:', error.message);
    next(error); // ✅ next is defined because function has (req, res, next)
  }
};

// Login - WITH next parameter
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        shopName: user.shopName,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error); // ✅ next is defined
  }
};