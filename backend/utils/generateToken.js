import jwt from "jsonwebtoken";

export const generateToken = (id, role = "user") =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const generateResetToken = () =>
  jwt.sign({ purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "1h" });
