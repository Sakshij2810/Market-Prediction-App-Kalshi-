import { z } from "zod";

// "/api/v1/auth/signup" req.body
export const signupSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

// "/api/v1/auth/signin" req.body
export const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// "/api/v1/auth/onramp" req.body
export const onrampSchema = z.object({
  amount: z.number().int().positive(),
});
