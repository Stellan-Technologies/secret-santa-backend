const router = require("express").Router();
const roomController = require("../controllers/roomController");

// CREATE ROOM
router.post("/create", roomController.createRoom);

// JOIN ROOM
router.post("/join", roomController.joinRoom);

module.exports = router;
