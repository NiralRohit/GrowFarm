const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['User', 'Bot'], required: true },
  message: { type: String, required: true },
  imageUrl: { type: String, default: null },         // If user sent an image
  quickReplies: [{ type: String }],
  model: { type: String, default: 'Gemini 2.0 Flash' },
}, { timestamps: true });

const chatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionTitle: { type: String, default: 'Farming Chat' },
  messages: [messageSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index for fast queries
chatHistorySchema.index({ userId: 1, isActive: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
