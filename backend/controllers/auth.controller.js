import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/users.model.js";
import Wallet from "../models/wallets.model.js";

import {
  onrampSchema,
  signinSchema,
  signupSchema,
} from "../types/auth.types.js";

// Register user
export const signup = async (req, res) => {
  try {
    // 1. safe parse req.body using zod signupSchema
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues,
      });
    }
    const { username, password } = parsed.data;

    // 2. check username already exits or not
    const exitingUser = await User.findOne({ username });

    if (exitingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // 3. hashed password
    const hasedPassword = await bcrypt.hash(password, 10);

    // 4. create new user entry in DB
    const newUser = await User.create({
      username,
      password: hasedPassword,
      balance: 0,
    });

    return res.status(201).json({
      message: "User created successfully",
      id: newUser._id,
      newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Login user
export const signin = async (req, res) => {
  try {
    // 1. safe parse req.body using zod signinSchema
    const parsed = signinSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues,
      });
    }

    const { username, password } = parsed.data;

    // 2. find user with username
    const user = await User.findOne({ username });

    // 3. compare user.password with hashedPassword
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // 4. Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRETE, {
      expiresIn: "1hr",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Add fake balance
export const addFakeBalance = async (req, res) => {
  try {
    // 1. safe parse req.body using zod signupSchema
    const parsed = onrampSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.issues,
      });
    }

    const { amount } = parsed.data;

    // 2. add amount in users account
    const { userId } = req.user;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: amount }, // increment balance by new amount
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(updatedUser);
    // 3. create wallent transaction entry for "onramp" transaction type
    await Wallet.create({
      userId: userId,
      transactionType: "onramp",
      amount: amount,
    });

    console.log("wallet entry created");

    return res.status(200).json({
      success: true,
      message: "Added balance successfully",
      updateBalance: updatedUser.balance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    console.log("hi from getUserProfile controller");

    res.status(200).json({ success: true, message: "Login Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Wallet history
export const getUserWalletHistory = async (req, res) => {
  try {
    console.log("hi from getUserWalletHistory controller");

    res.status(200).json({ success: true, message: "Login Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
