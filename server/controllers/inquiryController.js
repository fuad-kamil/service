const Inquiry = require('../models/Inquiry');
const Provider = require('../models/Provider');
const sendEmail = require('../utils/sendEmail');

const createInquiry = async (req, res, next) => {
  try {
    const { providerId, serviceId, subject, message } = req.body;
    const provider = await Provider.findById(providerId).populate('userId', 'email name');
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    const inquiry = await Inquiry.create({ userId: req.user._id, providerId, serviceId: serviceId || null, subject, message });
    await Provider.findByIdAndUpdate(providerId, { $inc: { inquiryCount: 1 } });
    await sendEmail({ to: provider.userId.email, subject: `New Inquiry: ${subject}`, html: `<p>New inquiry from <strong>${req.user.name}</strong></p><p>${message}</p>` });
    res.status(201).json({ success: true, inquiry });
  } catch (error) { next(error); }
};

const getUserInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user._id })
      .populate('providerId', 'businessName slug logo')
      .populate('serviceId', 'name').sort({ updatedAt: -1 });
    res.json({ success: true, inquiries });
  } catch (error) { next(error); }
};

const getProviderInquiries = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });
    const query = { providerId: provider._id };
    if (req.query.status) query.status = req.query.status;
    const inquiries = await Inquiry.find(query).populate('userId', 'name email avatar').populate('serviceId', 'name').sort({ updatedAt: -1 });
    res.json({ success: true, inquiries });
  } catch (error) { next(error); }
};

const replyToInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    const provider = await Provider.findById(inquiry.providerId);
    const isProvider = String(provider.userId) === String(req.user._id);
    const isUser = String(inquiry.userId) === String(req.user._id);
    if (!isProvider && !isUser && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!inquiry.replies) {
      inquiry.replies = [];
    }
    inquiry.replies.push({ sender: req.user._id, senderRole: isProvider ? 'provider' : 'user', message: req.body.message });
    inquiry.status = 'replied';
    await inquiry.save();
    res.json({ success: true, inquiry });
  } catch (error) { next(error); }
};

const updateInquiryStatus = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, inquiry });
  } catch (error) { next(error); }
};

module.exports = { createInquiry, getUserInquiries, getProviderInquiries, replyToInquiry, updateInquiryStatus };
