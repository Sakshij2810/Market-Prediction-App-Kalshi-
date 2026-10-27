import express from "express";
import { resolveMarket } from "../controllers/resolve.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const resolveRouter = express.Router();

resolveRouter.post("/", auth, resolveMarket);

export default resolveRouter;
