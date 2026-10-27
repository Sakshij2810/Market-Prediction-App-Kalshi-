import express from "express";
import { resolveMarket } from "../controllers/resolve.controller.js";

const resolveRouter = express.Router();

resolveRouter.post("/", resolveMarket);

export default resolveRouter;
