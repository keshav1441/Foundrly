import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    meme: { type: mongoose.Schema.Types.ObjectId, ref: "Meme", required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
