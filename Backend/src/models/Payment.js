const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  creditId: { type: mongoose.Schema.Types.ObjectId, ref: "Credit", required: true },
  shop: { type: String, required: true }, // e.g., shop1, shop2
  amount: { type: Number, required: true },
  mode: { type: String, enum: ["Cash", "UPI", "Card", "Cheque"], default: "Cash" },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);