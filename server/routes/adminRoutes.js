const express = require("express");
const {
  getAdminComplaints,
  getAdminComplaintById,
  updateComplaintStatus,
  addAdminRemarks,
  getUsers,
  getUserById,
  getAdmins,
  getAdminById,
  deleteComplaint,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validateObjectIdParam, validateStatus } = require("../middleware/validationMiddleware");

const router = express.Router();

router.get("/users", protect, authorize("admin"), getUsers);
router.get("/users/:id", protect, authorize("admin"), validateObjectIdParam("id"), getUserById);
router.get("/admins", protect, authorize("admin"), getAdmins);
router.get("/admins/:id", protect, authorize("admin"), validateObjectIdParam("id"), getAdminById);
router.get("/complaints", protect, authorize("admin"), getAdminComplaints);
router.get("/complaint/:id", protect, authorize("admin"), validateObjectIdParam("id"), getAdminComplaintById);
router.put("/complaint/:id", protect, authorize("admin"), validateObjectIdParam("id"), validateStatus, updateComplaintStatus);
router.put("/complaint/:id/remarks", protect, authorize("admin"), validateObjectIdParam("id"), addAdminRemarks);
router.delete("/complaint/:id", protect, authorize("admin"), validateObjectIdParam("id"), deleteComplaint);

module.exports = router;
