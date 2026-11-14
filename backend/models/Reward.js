import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    points: { type: Number, default: 0 },
    history: [
      {
        type: { type: String, enum: ["earn", "redeem"] },
        points: Number,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Reward", rewardSchema);
