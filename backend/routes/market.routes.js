import express from "express";
import {
  createMarket,
  listAllBets,
  listAllMarkets,
  placeBet,
} from "../controllers/market.controller.js";

const marketRouter = express.Router();

marketRouter.get("/", createMarket);
marketRouter.post("/", listAllMarkets);
marketRouter.get("/bets", listAllBets);
marketRouter.post("/bet", placeBet);

export default marketRouter;
