const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  desc: { type: String, trim: true, default: '' },
  color: { type: String, default: '#4f8ef7' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
