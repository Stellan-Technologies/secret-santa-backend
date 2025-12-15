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

exports.resendDrawEmails = async (req, res) => {
  try {
    const { roomCode } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(400).json({ message: "Invalid room code" });
    }

    const state = await DrawState.findOne({ roomId: room._id });
    if (!state || !state.hasDrawRun) {
      return res.status(400).json({ message: "Draw has not been run yet" });
    }

    const participants = await Participant.find({
      roomId: room._id,
      verified: true,
      assignedTo: { $exists: true }
    }).populate("assignedTo");

    if (participants.length === 0) {
      return res.status(400).json({ message: "No assignments found" });
    }

    for (const giver of participants) {
      await mailService.sendAssignmentEmail(
        giver.email,
        { name: giver.assignedTo.name }
      );
    }

    res.json({ message: "Draw emails resent successfully!" });

  } catch (err) {
    console.error("Resend draw error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- RESEND DRAW EMAIL ----------------
// exports.resendAssignmentEmail = async (req, res) => {
//   try {
//     const { email, roomCode } = req.body;

//     if (!email || !roomCode) {
//       return res.status(400).json({ message: "Email and room code required" });
//     }

//     const room = await Room.findOne({ roomCode });
//     if (!room) {
//       return res.status(400).json({ message: "Invalid room code" });
//     }

//     const participant = await Participant.findOne({
//       email,
//       roomId: room._id,
//       verified: true
//     }).populate("assignedTo");

//     if (!participant) {
//       return res.status(404).json({ message: "Verified participant not found" });
//     }

//     if (!participant.assignedTo) {
//       return res.status(400).json({ message: "Draw has not been run yet" });
//     }

//     // 🔥 RESEND the SAME assignment
//     await mailService.sendAssignmentEmail(
//       participant.email,
//       { name: participant.assignedTo.name }
//     );

//     res.json({ message: "Assignment email resent successfully" });

//   } catch (err) {
//     console.error("Resend Assignment Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

