const router = require("express").Router();
const drawController = require("../controllers/drawController");

router.post("/", drawController.runDraw);

// Get draw state for a room
router.get("/state", drawController.getDrawState);

// RESEND assignment email
// router.post("/resend", drawController.resendAssignmentEmail);

router.post("/resend", drawController.resendDrawEmails);

module.exports = router;
