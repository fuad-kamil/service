const User = require('../models/User');
const Provider = require('../models/Provider');

const getSavedProviders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProviders', 'businessName slug logo averageRating address verified status');
    res.json({ success: true, savedProviders: user.savedProviders });
  } catch (error) { next(error); }
};

const saveProvider = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedProviders) {
      user.savedProviders = [];
    }
    if (user.savedProviders.includes(req.params.providerId)) {
      return res.status(400).json({ success: false, message: 'Already saved' });
    }
    user.savedProviders.push(req.params.providerId);
    await user.save();
    res.json({ success: true, message: 'Provider saved' });
  } catch (error) { next(error); }
};

const unsaveProvider = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedProviders: req.params.providerId } });
    res.json({ success: true, message: 'Provider removed from saved' });
  } catch (error) { next(error); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, total, users });
  } catch (error) { next(error); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

module.exports = { getSavedProviders, saveProvider, unsaveProvider, getAllUsers, updateUserRole, deleteUser, updateProfile };
