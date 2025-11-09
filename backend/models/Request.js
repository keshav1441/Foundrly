import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ideaOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate requests
requestSchema.index({ requester: 1, idea: 1 }, { unique: true });

export default mongoose.model('Request', requestSchema);
