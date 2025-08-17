import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  originalImageUrl: { type: String, required: true },
  processedImageUrl: { type: String },
  selectedColors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Color' }],
  maskData: { type: String }, // base64 mask data
  detectionResults: { type: Object }, // Roboflow detection results
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);