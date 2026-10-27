import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  createMarket,
  listAllBets,
  listAllMarkets,
  placeBet,
} from "../controllers/market.controller.js";

const marketRouter = express.Router();

marketRouter.post("/", auth, createMarket);
marketRouter.get("/", listAllMarkets);

marketRouter.post("/bet", auth, placeBet);
marketRouter.get("/bets", auth, listAllBets);

export default marketRouter;
