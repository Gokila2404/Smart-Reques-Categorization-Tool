const express = require("express");
const {
  createComplaint,
  getMyComplaints,
  getMyComplaintById,
  updateMyComplaint,
  deleteMyComplaint,
  addFeedback,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const {
  validateComplaintCreate,
  validateComplaintUpdate,
  validateObjectIdParam,
  validateFeedback,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("user"),
  upload.single("attachment"),
  validateComplaintCreate,
  createComplaint
);
router.get("/", protect, authorize("user"), getMyComplaints);
router.get("/:id", protect, authorize("user"), validateObjectIdParam("id"), getMyComplaintById);
router.put("/:id", protect, authorize("user"), validateObjectIdParam("id"), validateComplaintUpdate, updateMyComplaint);
router.put("/:id/feedback", protect, authorize("user"), validateObjectIdParam("id"), validateFeedback, addFeedback);
router.delete("/:id", protect, authorize("user"), validateObjectIdParam("id"), deleteMyComplaint);

module.exports = router;
