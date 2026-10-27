import mongoose from "mongoose";

const walletSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["onramp", "created", "bet", "payout", "refund"],
      required: true,
    },
    externalId: {
      type: mongoose.Schema.Types.Mixed,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timeStamp: true },
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
