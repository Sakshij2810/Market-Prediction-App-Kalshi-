// --------------------------------- market's controllers ---------------------------------

import Bet from "../models/bets.model.js";
import Market from "../models/markets.model.js";
import User from "../models/users.model.js";
import Wallet from "../models/wallets.model.js";

import { createMarketSchema, placeBetSchema } from "../types/market.types.js";

// Create market
export const createMarket = async (req, res) => {
  try {
    // 1. safe parse the req.body
    const parsed = createMarketSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: parsed.error.issues });
    }

    const { title, initialWager, side, expiry } = parsed.data;
    const { userId } = req.user;

    // 2. validate market's expiry
    if (expiry <= new Date()) {
      return res.status(400).json({ error: "Invalid Expiry" });
    }

    // 3. find user and check if user has balance >= initialWager
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balance < initialWager) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 4. reduced initialWager from user's balance and save user in DB
    user.balance -= initialWager;
    await user.save();

    // 5. create market in DB
    const market = await Market.create({
      title,
      initialWager,
      side,
      creatorId: userId,
      expiry,
    });

    // 6. create wallet trancation entry
    await Wallet.create({
      userId,
      transactionType: "created",
      externalId: { marketId: market._id },
      amount: -initialWager,
    });

    // return
    return res.status(201).json({
      message: "Market created successfully",
      market,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// List All  markets
export const listAllMarkets = async (req, res) => {
  try {
    const allMarkets = await Market.find().populate("creatorId", "username"); // .populate("creatorId", "username") is a Mongoose method that fetches the creator's actual user details instead of returning only their ID.

    return res.status(200).json({ allMarkets });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// --------------------------------- bet's controllers ---------------------------------

// Place bet
export const placeBet = async (req, res) => {
  try {
    // 1. Validate request body
    const parsed = placeBetSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: parsed.error.issues });
    }

    const { marketId, betAmount } = parsed.data;
    const { userId } = req.user;

    // 2. Find the market
    const market = await Market.findById(marketId);

    if (!market) {
      return res.status(404).json({ error: "Market not found." });
    }

    // 3. Check market resolution — If resolution is not null, return an error because the market is already resolved.
    if (market.resolution != null) {
      return res.status(400).json({ error: "Market is already resolved." });
    }

    // 4. Check market expiry
    if (market.expiry <= new Date()) {
      return res.status(400).json({ error: "Market is already expired." });
    }

    // 5. Prevent creator betting — Compare the market's creatorId with the logged-in user's ID. If they match, reject the bet. creator cannot bet
    if (market.creatorId.toString() === userId) {
      return res
        .status(400)
        .json({ error: "Creator of Market not allowed to bet." });
    }

    // 6. Calculate existing bets — Fetch all bets for this market and calculate their total amount using reduce().
    const existingBets = await Bet.find({ marketId });

    const totalBetsAmount = existingBets.reduce(
      (sum, bet) => sum + bet.betAmount,
      0,
    );

    // 7. Check available amount — If totalBets + amount exceeds the market's initialWager, reject the bet.
    if (totalBetsAmount + betAmount > market.initialWager) {
      return res
        .status(400)
        .json({ error: "Bet exceeds remaining available amount" });
    }

    // 8. Find the betting user & Check user balance — If the user doesn't exist or their balance is less than the bet amount, reject the bet.
    const bettingUser = await User.findById(userId);

    if (!bettingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (bettingUser.balance < betAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 9. Deduct balance — Subtract the bet amount from the user's balance and save the updated user.
    bettingUser.balance -= betAmount;
    await bettingUser.save();

    // 10. Create the bet
    const bet = await Bet.create({
      userId,
      marketId,
      betAmount,
    });

    // 11. Create a wallet transaction type "bet"
    await Wallet.create({
      userId,
      transactionType: "bet",
      externalId: { marketId, betId: bet._id },
      amount: -betAmount,
    });

    // return
    return res.status(200).json({ message: "Bet created successfully", bet });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// User's All bets
export const listAllBets = async (req, res) => {
  try {
    const { userId } = req.user;

    const allBetsOfCurrentUser = await Bet.find({ userId }).populate(
      "marketId",
    );

    return res.status(200).json({
      allBetsOfCurrentUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
