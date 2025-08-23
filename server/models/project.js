import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  originalImageUrl: { type: String, required: true },
  processedImageUrl: { type: String },
  plainImageUrl: { type: String }, // Always generated - plain painted version
  patternImageUrl: { type: String }, // Generated only if pattern selected
  selectedColors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }],
  pattern: { type: String, default: 'plain' }, // Selected paint pattern
  maskData: { type: String }, // base64 mask data
  detectionResults: { type: Object }, // Roboflow detection results
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);