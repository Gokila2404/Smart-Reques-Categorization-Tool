const express = require("express");
const {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
  updateMyComplaint,
  deleteMyComplaint,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validateComplaintCreate,
  validateComplaintUpdate,
  validateObjectIdParam,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/", protect, authorize("user"), validateComplaintCreate, createComplaint);
router.get("/", protect, authorize("user"), getMyComplaints);
router.get("/:id", protect, authorize("user"), validateObjectIdParam("id"), getMyComplaintById);
router.put("/:id", protect, authorize("user"), validateObjectIdParam("id"), validateComplaintUpdate, updateMyComplaint);
router.delete("/:id", protect, authorize("user"), validateObjectIdParam("id"), deleteMyComplaint);

module.exports = router;
