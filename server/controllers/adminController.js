const Complaint = require("../models/Complaint");
const User = require("../models/User");
const categorizeComplaint = require("../utils/categorize");
const determinePriority = require("../utils/priority");

const userProjection = "_id name email role adminDomain createdAt updatedAt";

const getAdminComplaintQuery = (adminUser, extra = {}) => {
  const query = { ...extra };
  if (adminUser.adminDomain && adminUser.adminDomain !== "General") {
    query.category = adminUser.adminDomain;
  }
  return query;
};

const assignAdminByCategory = async (category, fallbackAdminId = null) => {
  const admin = await User.findOne({ role: "admin", adminDomain: category }).select("_id");
  if (admin) return admin._id;

  const fallback = await User.findOne({ role: "admin", adminDomain: "General" }).select("_id");
  return fallback ? fallback._id : fallbackAdminId;
};

exports.createAdminComplaint = async (req, res) => {
  try {
    const { userId, title, place = "", date = "", time = "", description, priority } = req.body;

    const targetUser = await User.findOne({ _id: userId, role: "user" }).select("_id");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const category = categorizeComplaint(description);
    if (req.user.adminDomain && req.user.adminDomain !== "General" && category !== req.user.adminDomain) {
      return res.status(403).json({ message: "You can only create complaints in your admin domain" });
    }

    const resolvedPriority = priority || determinePriority(title, description);
    const assignedAdminId = await assignAdminByCategory(category, req.user.id);

    const complaint = await Complaint.create({
      title: title.trim(),
      place: place.trim(),
      date: date.trim(),
      time: time.trim(),
      description: description.trim(),
      category,
      priority: resolvedPriority,
      userId: targetUser._id,
      adminId: assignedAdminId,
      statusHistory: [
        {
          action: "Created by Admin",
          status: "New",
          note: "Complaint created from admin dashboard",
          by: req.user.id,
        },
      ],
    });

    const populated = await Complaint.findById(complaint._id)
      .populate("userId", "name email")
      .populate("adminId", "name email");

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAdminComplaints = async (req, res) => {
  try {
    const query = getAdminComplaintQuery(req.user);

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
    const query = getAdminComplaintQuery(req.user, { _id: id });

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

    const complaint = await Complaint.findOne(getAdminComplaintQuery(req.user, { _id: id }));
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

    const complaint = await Complaint.findOne(getAdminComplaintQuery(req.user, { _id: id }));
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

exports.updateAdminComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne(getAdminComplaintQuery(req.user, { _id: id }));

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const { title, place, date, time, description, priority, status, userId, adminRemarks } = req.body;

    if (userId !== undefined && userId !== String(complaint.userId)) {
      const targetUser = await User.findOne({ _id: userId, role: "user" }).select("_id");
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      complaint.userId = targetUser._id;
    }

    if (title !== undefined) complaint.title = title.trim();
    if (place !== undefined) complaint.place = place.trim();
    if (date !== undefined) complaint.date = date.trim();
    if (time !== undefined) complaint.time = time.trim();
    if (priority !== undefined) complaint.priority = priority;
    if (status !== undefined) complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

    if (description !== undefined) {
      const nextDescription = description.trim();
      const nextCategory = categorizeComplaint(nextDescription);

      if (req.user.adminDomain && req.user.adminDomain !== "General" && nextCategory !== req.user.adminDomain) {
        return res.status(403).json({ message: "You can only move complaints within your admin domain" });
      }

      complaint.description = nextDescription;
      complaint.category = nextCategory;
      complaint.adminId = await assignAdminByCategory(nextCategory, req.user.id);
    } else {
      complaint.adminId = complaint.adminId || req.user.id;
    }

    complaint.statusHistory.push({
      action: "Admin Update",
      status: complaint.status,
      note: "Complaint details updated by admin",
      by: req.user.id,
    });

    if (complaint.status === "Solved") {
      complaint.solvedAt = complaint.solvedAt || new Date();
    } else {
      complaint.solvedAt = null;
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate("userId", "name email")
      .populate("adminId", "name email");

    return res.json(updated);
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
    const deleted = await Complaint.findOneAndDelete(getAdminComplaintQuery(req.user, { _id: id }));

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
