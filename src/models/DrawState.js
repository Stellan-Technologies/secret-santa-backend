const mongoose = require("mongoose");

const drawStateSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  hasDrawRun: { type: Boolean, default: false },
  lastCount: { type: Number, default: 0 } // how many verified participants when draw ran
});

module.exports = mongoose.model("DrawState", drawStateSchema);
