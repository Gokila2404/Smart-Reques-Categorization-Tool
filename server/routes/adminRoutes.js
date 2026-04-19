const express = require("express");
const {
  createAdminComplaint,
  getAdminComplaints,
  getAdminComplaintById,
  updateComplaintStatus,
  updateAdminComplaint,
  addAdminRemarks,
  getUsers,
  getUserById,
  getAdmins,
  getAdminById,
  deleteComplaint,
  getAdminStats,
  getDashboardAnalytics,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validateComplaintCreate,
  validateComplaintUpdate,
  validateObjectIdParam,
  validateStatus,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/users", protect, authorize("admin"), getUsers);
router.get("/users/:id", protect, authorize("admin"), validateObjectIdParam("id"), getUserById);
router.get("/admins", protect, authorize("admin"), getAdmins);
router.get("/admins/:id", protect, authorize("admin"), validateObjectIdParam("id"), getAdminById);
router.get("/stats", protect, authorize("admin"), getAdminStats);
router.get("/analytics", protect, authorize("admin"), getDashboardAnalytics);
router.post("/complaints", protect, authorize("admin"), validateComplaintCreate, createAdminComplaint);
router.get("/complaints", protect, authorize("admin"), getAdminComplaints);
router.get("/complaint/:id", protect, authorize("admin"), validateObjectIdParam("id"), getAdminComplaintById);
router.put("/complaint/:id", protect, authorize("admin"), validateObjectIdParam("id"), validateStatus, updateComplaintStatus);
router.put("/complaint/:id/details", protect, authorize("admin"), validateObjectIdParam("id"), validateComplaintUpdate, updateAdminComplaint);
router.put("/complaint/:id/remarks", protect, authorize("admin"), validateObjectIdParam("id"), addAdminRemarks);
router.delete("/complaint/:id", protect, authorize("admin"), validateObjectIdParam("id"), deleteComplaint);

module.exports = router;
