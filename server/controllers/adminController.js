const Complaint = require("../models/Complaint");
const User = require("../models/User");

const userProjection = "_id name email role adminDomain createdAt updatedAt";

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

exports.getAdminComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: id };

    if (req.user.adminDomain && req.user.adminDomain !== "General") {
      query.category = req.user.adminDomain;
    }

    const complaint = await Complaint.findOne(query)
      .populate("userId", "name email")
      .populate("adminId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select(userProjection).sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, role: "user" }).select(userProjection);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select(userProjection).sort({ createdAt: -1 });
    return res.json(admins);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findOne({ _id: id, role: "admin" }).select(userProjection);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json(admin);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Complaint.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
