const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  verified: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }
});

// 🔥 Prevent duplicate email inside same room
participantSchema.index({ email: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model("Participant", participantSchema);
