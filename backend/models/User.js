import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, minlength: 6 },
    googleId: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    rewardPoints: { type: Number, default: 0 },
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    newsletter: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hash(next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function match(entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
