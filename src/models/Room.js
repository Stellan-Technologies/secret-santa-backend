const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Room", RoomSchema);
