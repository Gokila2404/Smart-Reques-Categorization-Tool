const express = require("express");
const {
  getAdminComplaints,
  updateComplaintStatus,
  addAdminRemarks,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/complaints", protect, authorize("admin"), getAdminComplaints);
router.put("/complaint/:id", protect, authorize("admin"), updateComplaintStatus);
router.put("/complaint/:id/remarks", protect, authorize("admin"), addAdminRemarks);

module.exports = router;
