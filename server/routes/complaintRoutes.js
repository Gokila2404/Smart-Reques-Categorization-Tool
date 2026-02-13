const express = require("express");
const { createComplaint, getMyComplaints } = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("user", "admin"), createComplaint);
router.get("/", protect, authorize("user", "admin"), getMyComplaints);

module.exports = router;
