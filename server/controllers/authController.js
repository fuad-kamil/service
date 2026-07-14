const User = require('../models/User');
const Provider = require('../models/Provider');
const { generateTokens } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc  Register user or provider
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const allowedRoles = ['user', 'provider'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const user = await User.create({ name, email, password, role: userRole });
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Attach provider profile id if role is provider
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id }).select('_id slug status');
    }

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        providerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Refresh access token
// @route POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout
// @route POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProviders', 'businessName slug logo averageRating');
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id }).select('_id slug status businessName');
    }
    res.json({ success: true, user: { ...user.toObject(), providerProfile } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe };
