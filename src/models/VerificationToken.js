const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
  token: { type: String, required: true },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 30 // 30 minutes
  }
});

// 🔥 Automatically delete token when expired
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("VerificationToken", tokenSchema);
