import { z } from "zod";

// "/api/v1/market" req.body
export const createMarketSchema = z.object({
  title: z.string().min(3),
  initialWager: z.number().int().positive(),
  side: z.enum(["yes", "no"]),
  expiry: z.coerce.date(), // coerce → tries to convert the input into the required type. date() → expects a valid JavaScript Date object.
});

// "/api/v1/market/bet" req.body
export const placeBetSchema = z.object({
  marketId: z.string(),
  betAmount: z.number().int().positive(),
});
