import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import marketRouter from "./routes/market.routes.js";
import resolveRouter from "./routes/resolve.routes.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 6000;

// all routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/market", marketRouter);
app.use("/api/v1/resolve", resolveRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
  connectDB();
});
