const Participant = require("../models/Participant");
const Room = require("../models/Room");
const DrawState = require("../models/DrawState");
const drawService = require("../services/drawService");
const mailService = require("../services/mailService");

exports.runDraw = async (req, res) => {
  try {
    const { roomCode } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(400).json({ message: "Invalid room code" });

    const participants = await Participant.find({
      verified: true,
      roomId: room._id
    }).populate("roomId");

    if (participants.length < 3) {
      return res.status(400).json({ message: "Minimum 3 participants required." });
    }

    let state = await DrawState.findOne({ roomId: room._id });

    if (state?.hasDrawRun && state.lastCount === participants.length) {
      return res.status(400).json({ message: "Draw already completed." });
    }

    const pairs = drawService.drawAssignments(participants);

    for (const pair of pairs) {
      await Participant.findByIdAndUpdate(pair.giver._id, {
        assignedTo: pair.receiver._id
      });

      await mailService.sendAssignmentEmail(
        pair.giver.email,
        { name: pair.receiver.name }
      );
    }

    if (!state) {
      await DrawState.create({
        roomId: room._id,
        hasDrawRun: true,
        lastCount: participants.length
      });
    } else {
      state.hasDrawRun = true;
      state.lastCount = participants.length;
      await state.save();
    }

    res.json({ message: "Secret Santa draw complete!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- DRAW STATE ----------------
exports.getDrawState = async (req, res) => {
  try {
    const { roomCode } = req.query;

    const room = await Room.findOne({ roomCode });
    if (!room)
      return res.status(400).json({ message: "Invalid room code" });

    const state = await DrawState.findOne({ roomId: room._id });

    res.json(state || { hasDrawRun: false, lastCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
