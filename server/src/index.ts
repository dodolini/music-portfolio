import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import beatsRouter from "./routes/beats.routes";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();
const PORT = 4000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());


import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));



app.use("/api", authRoutes);
app.use("/beats", beatsRouter);

app.use("/uploads",
  cors({ origin: "http://localhost:3000" }),
  express.static(path.join(__dirname, "../uploads")));


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
