const Review = require('../models/Review');
const Provider = require('../models/Provider');

const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) { next(error); }
};

const createReview = async (req, res, next) => {
  try {
    const { providerId, rating, comment } = req.body;
    const existing = await Review.findOne({ userId: req.user._id, providerId });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this provider' });
    const review = await Review.create({ userId: req.user._id, providerId, rating, comment });
    // Recalculate average rating
    const stats = await Review.aggregate([{ $match: { providerId: review.providerId } }, { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }]);
    if (stats.length > 0) {
      await Provider.findByIdAndUpdate(providerId, { averageRating: Math.round(stats[0].avgRating * 10) / 10, reviewCount: stats[0].count });
    }
    res.status(201).json({ success: true, review });
  } catch (error) { next(error); }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (String(review.userId) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) { next(error); }
};

module.exports = { getProviderReviews, createReview, deleteReview };
