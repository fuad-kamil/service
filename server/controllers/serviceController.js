const Service = require('../models/Service');
const Provider = require('../models/Provider');

// @desc  Get all services (with filters)
// @route GET /api/services
const getServices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, categoryId, providerId, priceType, minPrice, maxPrice } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (categoryId) query.categoryId = categoryId;
    if (providerId) query.providerId = providerId;
    if (priceType) query.priceType = priceType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('categoryId', 'name icon')
      .populate('providerId', 'businessName slug logo verified averageRating address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, count: services.length, total, pages: Math.ceil(total / limit), services });
  } catch (error) {
    next(error);
  }
};

// @desc  Get services by provider
// @route GET /api/services/provider/:providerId
const getServicesByProvider = async (req, res, next) => {
  try {
    const services = await Service.find({ providerId: req.params.providerId, isActive: true })
      .populate('categoryId', 'name icon slug');
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single service
// @route GET /api/services/:id
const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('categoryId', 'name icon')
      .populate('providerId', 'businessName slug logo verified address contactInfo workingHours averageRating');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc  Create service
// @route POST /api/services
const createService = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) return res.status(400).json({ success: false, message: 'No provider profile found. Create one first.' });
    if (provider.status !== 'active') return res.status(403).json({ success: false, message: 'Provider profile must be approved before adding services.' });

    const service = await Service.create({ ...req.body, providerId: provider._id });
    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc  Update service
// @route PUT /api/services/:id
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id).populate('providerId');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (String(service.providerId.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete service
// @route DELETE /api/services/:id
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('providerId');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (String(service.providerId.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await service.deleteOne();
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getServicesByProvider, getService, createService, updateService, deleteService };
