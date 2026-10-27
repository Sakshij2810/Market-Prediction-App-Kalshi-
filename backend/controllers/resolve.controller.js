import Market from "../models/markets.model.js";
import Bet from "../models/bets.model.js";
import Wallet from "../models/wallets.model.js";
import User from "../models/users.model.js";

import { resolveMarketSchema } from "../types/resolve.types.js";

// Resolve market
export const resolveMarket = async (req, res) => {
  try {
    // 1. safe parse req.body
    const parsed = resolveMarketSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: parsed.error.issues });
    }
    const { marketId, resolution } = parsed.data;
    const { userId } = req.user;

    // 2. find market
    const market = await Market.findById(marketId);

    if (!market) {
      return res.status(404).json({
        error: "Market not found",
      });
    }

    // 3. Only creator can resolve market
    if (userId !== market.creatorId.toString()) {
      return res.status(403).json({
        error: "Only creator can resolve Market",
      });
    }

    // 4. Check market resolution status — If the market's resolution is already not null, reject the request because the market has already been resolved.
    if (market.resolution !== null) {
      return res.status(400).json({
        error: "Market already resolved",
      });
    }

    // 5. Fetch all bets — Retrieve all Bet documents belonging to this market.
    const allBets = await Bet.find({ marketId });

    // 6. Calculate total bets — Use reduce() to calculate the sum of all betAmount values.
    const totalBetAmount = allBets.reduce((sum, bet) => sum + bet.betAmount, 0);

    // 7. Compare the creator's side with the final resolution — Check whether market.side === resolution.
    const isCreatorWin = resolution === market.side;

    // 8. If the creator wins:
    if (isCreatorWin) {
      // 1. Calculate the creator's payout as totalBets × 2 + unmatched creator stake.
      const creatorPayout =
        totalBetAmount * 2 + (market.initialWager - totalBetAmount);

      // 2. Add the payout to the creator's balance using User.updateOne() and $inc.
      await User.updateOne(
        {
          _id: market.creatorId,
        },
        { $inc: { balance: creatorPayout } },
      );

      // 3. Create a "payout" wallet transaction for the creator.
      await Wallet.create({
        userId,
        transactionType: "payout",
        externalId: { marketId },
        amount: creatorPayout,
      });
    } else {
      // 9. If the bettors win:

      // 1. Loop through all bets.

      for (const bet of allBets) {
        // 2. calculate their payout as betAmount × 2.
        const bettorPayout = bet.betAmount * 2;

        // 3. Add the payout to that bettor's balance.
        await User.updateOne(
          { _id: bet.userId },
          { $inc: { balance: bettorPayout } },
        );

        // 4. Create a "payout" wallet transaction for each bettor.
        await Wallet.create({
          userId: bet.userId,
          transactionType: "payout",
          externalId: { marketId, betId: bet._id },
          amount: bettorPayout,
        });
      }

      // 2. Refund unmatched creator stake
      const refund = market.initialWager - totalBetAmount;

      // 3. If the refund > zero, return it to the creator's balance and create a "refund" wallet transaction.
      if (refund > 0) {
        await User.updateOne(
          { _id: market.creatorId },
          {
            $inc: { balance: refund },
          },
        );

        await Wallet.create({
          userId: market.creatorId,
          transactionType: "refund",
          externalId: {
            marketId,
          },
          amount: refund,
        });
      }
    }

    // 9. Update & Save the market resolution — Set market.resolution to the provided resolution.
    market.resolution = resolution;
    await market.save();

    // return
    return res
      .status(200)
      .json({ message: "Resolved Market Successfully.", market });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};
