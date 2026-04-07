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
    if (status === "Solved") {
      complaint.solvedAt = complaint.solvedAt || new Date();
    }
    complaint.statusHistory.push({
      action: "Status Update",
      status,
      note: `Status changed to ${status}`,
      by: req.user.id,
    });
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
    complaint.statusHistory.push({
      action: "Admin Remarks",
      status: complaint.status,
      note: remarks || "Remarks updated",
      by: req.user.id,
    });
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

exports.getAdminStats = async (req, res) => {
  try {
    const solvedComplaints = await Complaint.find({
      adminId: req.user.id,
      status: "Solved",
      solvedAt: { $ne: null },
    }).select("createdAt solvedAt");

    const solvedCount = solvedComplaints.length;
    const totalMs = solvedComplaints.reduce((acc, item) => {
      return acc + (new Date(item.solvedAt) - new Date(item.createdAt));
    }, 0);
    const avgResponseMs = solvedCount > 0 ? totalMs / solvedCount : 0;

    return res.json({
      solvedCount,
      avgResponseHours: avgResponseMs / (1000 * 60 * 60),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalCount, todayCount, statusCounts, categoryCounts] = await Promise.all([
      Complaint.countDocuments({}),
      Complaint.countDocuments({ createdAt: { $gte: startOfToday } }),
      Complaint.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    const categoryMap = categoryCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const solvedCount = statusMap.Solved || 0;
    const pendingCount = (statusMap.New || 0) + (statusMap["In Progress"] || 0);
    const solvedRate = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

    return res.json({
      totalCount,
      todayCount,
      status: {
        new: statusMap.New || 0,
        inProgress: statusMap["In Progress"] || 0,
        solved: solvedCount,
        pending: pendingCount,
      },
      categories: {
        Networking: categoryMap.Networking || 0,
        Fees: categoryMap.Fees || 0,
        Discipline: categoryMap.Discipline || 0,
        General: categoryMap.General || 0,
      },
      solvedRate,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
