const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['user', 'provider'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const inquirySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'closed'],
      default: 'unread',
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
