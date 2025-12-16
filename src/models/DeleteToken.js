const mongoose = require("mongoose");

const deleteTokenSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 30 // 30 minutes
  }
});

module.exports = mongoose.model("DeleteToken", deleteTokenSchema);
