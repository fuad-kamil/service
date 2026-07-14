const Provider = require('../models/Provider');
const User = require('../models/User');
const Service = require('../models/Service');
const slugify = require('slugify');

// @desc  Get all providers (with search/filter/pagination)
// @route GET /api/providers
const getProviders = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, search, category, providerType,
      city, lat, lng, radius = 20, minRating, status, verified
    } = req.query;

    const query = {};

    // Only show active providers to public, or if no status is specified
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'active';
    } else if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    if (search) {
      query.$text = { $search: search };
    }
    if (providerType) query.providerType = providerType;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (minRating) query.averageRating = { $gte: Number(minRating) };
    if (verified === 'true') query.verified = true;

    // Geo-near query
    let geoQuery = null;
    if (lat && lng) {
      geoQuery = {
        near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        distanceField: 'distance',
        maxDistance: radius * 1000,
        spherical: true,
        query,
      };
    }

    let providers;
    let total;

    if (geoQuery) {
      const agg = await Provider.aggregate([
        { $geoNear: geoQuery },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
      ]);
      providers = agg;
      total = agg.length;
    } else {
      total = await Provider.countDocuments(query);
      providers = await Provider.find(query)
        .sort({ averageRating: -1, profileViews: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    res.json({
      success: true,
      count: providers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single provider by slug
// @route GET /api/providers/:slug
const getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ slug: req.params.slug }).populate('userId', 'name email createdAt');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    if (provider.status !== 'active' && (!req.user || (req.user.role !== 'admin' && String(provider.userId._id) !== String(req.user._id)))) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    // Increment profile views
    await Provider.findByIdAndUpdate(provider._id, { $inc: { profileViews: 1 } });
    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc  Create provider profile
// @route POST /api/providers
const createProvider = async (req, res, next) => {
  try {
    const existing = await Provider.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Provider profile already exists' });
    }

    const { businessName, ...rest } = req.body;
    let slug = slugify(businessName, { lower: true, strict: true });
    const slugExists = await Provider.findOne({ slug });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    const provider = await Provider.create({
      userId: req.user._id,
      businessName,
      slug,
      ...rest,
    });

    res.status(201).json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc  Update provider profile
// @route PUT /api/providers/:id
const updateProvider = async (req, res, next) => {
  try {
    let provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    // Only own provider or admin
    if (String(provider.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Don't let providers change their own status/verified
    if (req.user.role !== 'admin') {
      delete req.body.status;
      delete req.body.verified;
    }

    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete provider
// @route DELETE /api/providers/:id
const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    await provider.deleteOne();
    await Service.deleteMany({ providerId: provider._id });
    res.json({ success: true, message: 'Provider deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify/unverify provider (Admin)
// @route PATCH /api/providers/:id/verify
const verifyProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { verified: req.body.verified },
      { new: true }
    );
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc  Update provider status (Admin)
// @route PATCH /api/providers/:id/status
const updateProviderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const provider = await Provider.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    // Update user role if activating a provider
    if (status === 'active') {
      await User.findByIdAndUpdate(provider.userId, { role: 'provider' });
    }

    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

// @desc  Get provider analytics
// @route GET /api/providers/:id/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    if (String(provider.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const serviceCount = await Service.countDocuments({ providerId: provider._id });
    res.json({
      success: true,
      analytics: {
        profileViews: provider.profileViews,
        inquiryCount: provider.inquiryCount,
        serviceCount,
        averageRating: provider.averageRating,
        reviewCount: provider.reviewCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get my provider profile
// @route GET /api/providers/me
const getMyProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'No provider profile found' });
    res.json({ success: true, provider });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProviders, getProvider, createProvider, updateProvider, deleteProvider, verifyProvider, updateProviderStatus, getAnalytics, getMyProvider };
