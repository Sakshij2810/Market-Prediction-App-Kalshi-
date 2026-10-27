import express from "express";
import {
  addFakeBalance,
  getUserWalletHistory,
  getUserProfile,
  signin,
  signup,
} from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

authRouter.post("/onramp", auth, addFakeBalance);
authRouter.get("/profile", auth, getUserProfile);
authRouter.get("/transactions", auth, getUserWalletHistory);

export default authRouter;
