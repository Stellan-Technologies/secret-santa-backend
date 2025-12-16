const Participant = require("../models/Participant");
const VerificationToken = require("../models/VerificationToken");
const generateToken = require("../utils/generateToken");
const mailService = require("../services/mailService");
const DeleteToken = require("../models/DeleteToken");
const DrawState = require("../models/DrawState");
const Room = require("../models/Room");  // <-- REQUIRED IMPORT

// ---------------------- REGISTER ----------------------
exports.register = async (req, res) => {
  try {
    const { name, email, roomCode } = req.body;

    if (!name || !email || !roomCode) {
      return res.status(400).json({ message: "Name, email, and room code are required" });
    }

    // 1️⃣ Validate room
    const room = await Room.findOne({ roomCode });
    if (!room) {
      return res.status(400).json({ message: "Invalid room code" });
    }

    // 2️⃣ Find participant only inside this room
    let user = await Participant.findOne({ email, roomId: room._id });

    if (user && user.verified) {
      return res.status(400).json({ message: "Email already registered in this room" });
    }

    // 3️⃣ Create new participant if not found
    if (!user) {
      user = await Participant.create({
        name,
        email,
        roomId: room._id,
      });
    }

    // 4️⃣ Create verification token
    const token = generateToken();

    await VerificationToken.create({
      participantId: user._id,
      token
    });

    // 5️⃣ Send email (includes roomCode in URL)
    await mailService.sendVerificationEmail(email, token, user._id, roomCode);

    res.json({ message: "Verification email sent." });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- VERIFY ----------------------
exports.verify = async (req, res) => {
  try {
    const { token, id } = req.query;

    const record = await VerificationToken.findOne({ participantId: id, token });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(400).json({ message: "Participant not found" });
    }

    // Mark verified
    await Participant.findByIdAndUpdate(id, { verified: true });

    // Remove used tokens
    await VerificationToken.deleteMany({ participantId: id });

    // ⭐ Get roomCode properly
    const room = await Room.findById(participant.roomId);

    res.json({
      message: "Email verified successfully!",
      roomCode: room.roomCode
    });

  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------- RESEND VERIFICATION EMAIL ----------------------
exports.resendVerification = async (req, res) => {
  const { email, roomCode } = req.body;

  const room = await Room.findOne({ roomCode });
  if (!room) return res.status(400).json({ message: "Invalid room" });

  const user = await Participant.findOne({
    email,
    roomId: room._id,
    verified: false
  });

  if (!user) {
    return res.status(400).json({ message: "User already verified or not found" });
  }

  await VerificationToken.deleteMany({ participantId: user._id });

  const token = generateToken();
  await VerificationToken.create({ participantId: user._id, token });

  await mailService.sendVerificationEmail(email, token, user._id, roomCode);

  res.json({ message: "Verification email resent" });
};

exports.resendDeleteEmail = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID required" });
    }

    const participant = await Participant.findById(participantId).populate("roomId");
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // ❌ Block delete after draw
    const drawState = await DrawState.findOne({ roomId: participant.roomId._id });
    if (drawState?.hasDrawRun) {
      return res.status(403).json({ message: "Cannot delete after draw" });
    }

    const token = generateToken();

    await DeleteToken.create({
      participantId: participant._id,
      token
    });

    await mailService.sendDeleteConfirmationEmail(
      participant.email,
      token,
      participant._id,
      participant.roomId.roomCode
    );

    res.json({ message: "Delete confirmation email sent" });

  } catch (err) {
    console.error("Resend delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.confirmDelete = async (req, res) => {
  try {
    const { token, id } = req.query;

    const record = await DeleteToken.findOne({ participantId: id, token });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const participant = await Participant.findById(id);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Final safety check
    const drawState = await DrawState.findOne({ roomId: participant.roomId });
    if (drawState?.hasDrawRun) {
      return res.status(403).json({ message: "Cannot delete after draw" });
    }

    await Participant.findByIdAndDelete(id);
    await DeleteToken.deleteMany({ participantId: id });

    res.json({ message: "Participant deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ---------------------- GET VERIFIED PARTICIPANTS ----------------------
exports.getAllVerified = async (req, res) => {
  try {
    const { roomCode } = req.query;

    if (!roomCode)
      return res.status(400).json({ message: "Room code missing" });

    const room = await Room.findOne({ roomCode });
    if (!room)
      return res.status(400).json({ message: "Invalid room code" });

    const participants = await Participant.find({
      roomId: room._id,
      verified: true
    }).select("name");

    res.json({ participants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

