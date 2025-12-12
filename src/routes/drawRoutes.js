const router = require("express").Router();
const drawController = require("../controllers/drawController");

router.post("/", drawController.runDraw);

// Get draw state for a room
router.get("/state", drawController.getDrawState);

module.exports = router;
