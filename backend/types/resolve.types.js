import { z } from "zod";

// "/api/v1/resolve" req.body
export const resolveMarketSchema = z.object({
  marketId: z.string(),
  resolution: z.enum(["yes", "no"]),
});
