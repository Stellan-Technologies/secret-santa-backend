const router = require("express").Router();
const controller = require("../controllers/participantController");

// Register inside a room
router.post("/register", controller.register);

// Verify email
router.get("/verify", controller.verify);

// Get all verified participants for a room
router.get("/verified/all", controller.getAllVerified);

module.exports = router;
