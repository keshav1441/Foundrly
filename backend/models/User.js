import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Don't return password by default
    name: String,
    avatar: String,
    role: {
      type: String,
      enum: ['Visionary', 'Code', 'Marketing', 'Fundless VC'],
      default: 'Visionary',
    },
    bio: String,
    googleId: String,
    githubId: String,
    linkedinId: String,
    xp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

