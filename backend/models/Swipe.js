import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    direction: { type: String, enum: ['left', 'right'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Swipe', swipeSchema);

