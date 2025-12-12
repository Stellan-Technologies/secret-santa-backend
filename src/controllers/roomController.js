const Room = require("../models/Room");

// CREATE ROOM
exports.createRoom = async (req, res) => {
  try {
    function generateRoomCode() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    let roomCode = generateRoomCode();
    while (await Room.findOne({ roomCode })) {
      roomCode = generateRoomCode();
    }

    const room = await Room.create({ roomCode });

    res.json({ 
      message: "Room created", 
      roomCode 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// JOIN ROOM
exports.joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(400).json({ message: "Invalid room code" });
    }

    res.json({ 
      message: "Room found", 
      roomId: room._id 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
