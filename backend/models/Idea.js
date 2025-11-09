import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    oneLiner: { type: String, required: true },
    tags: [String],
    memeImage: String,
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    swipeRightCount: { type: Number, default: 0 },
    swipeLeftCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Idea', ideaSchema);

