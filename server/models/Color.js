import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hexCode: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String }, // e.g., 'neutral', 'warm', 'cool', 'bold'
  finish: { type: String }, // e.g., 'matte', 'satin', 'gloss'
  price: { type: Number },
  popularity: { type: Number, default: 0 },
  description: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient searching
colorSchema.index({ brand: 1, category: 1 });
colorSchema.index({ hexCode: 1 });
colorSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Color', colorSchema);