import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db.js";
import { setIO } from "./utils/io.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import customRoutes from "./routes/custom.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import Banner from "./models/Banner.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
});
setIO(io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next();
  }
});

io.on("connection", (socket) => {
  if (socket.userId) socket.join(String(socket.userId));
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, brand: "BloomBar" }));
app.get("/api/banners", async (_req, res) => res.json(await Banner.find({ active: true })));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/custom", customRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => server.listen(port, () => console.log(`BloomBar API on ${port}`)))
  .catch((e) => {
    console.error("DB connection failed", e);
    process.exit(1);
  });
