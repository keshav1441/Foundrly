import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    user1Read: { type: Boolean, default: false },
    user2Read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Match', matchSchema);

