const mongoose = require('mongoose');

const listedProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, default: 'Другое' },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ListedProduct', listedProductSchema);
