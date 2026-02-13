const Complaint = require("../models/Complaint");

exports.getAdminComplaints = async (req, res) => {
  try {
    const query = req.user.adminDomain && req.user.adminDomain !== "General"
      ? { category: req.user.adminDomain }
      : {};

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("adminId", "name email");

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["New", "In Progress", "Solved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.adminId = req.user.id;
    await complaint.save();

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addAdminRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.adminRemarks = remarks || "";
    complaint.adminId = req.user.id;
    await complaint.save();

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
