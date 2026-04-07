const Complaint = require("../models/Complaint");
const User = require("../models/User");
const categorizeComplaint = require("../utils/categorize");
const determinePriority = require("../utils/priority");

const assignAdminByCategory = async (category) => {
  const admin = await User.findOne({ role: "admin", adminDomain: category }).select("_id");
  if (admin) return admin._id;

  const fallback = await User.findOne({ role: "admin", adminDomain: "General" }).select("_id");
  return fallback ? fallback._id : null;
};

exports.createComplaint = async (req, res) => {
  try {
    const { title, place = "", date = "", time = "", description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const category = categorizeComplaint(description);
    const resolvedPriority = priority || determinePriority(title, description);
    const adminId = await assignAdminByCategory(category);

    const complaint = await Complaint.create({
      title: title.trim(),
      place: place.trim(),
      date: date.trim(),
      time: time.trim(),
      description: description.trim(),
      category,
      priority: resolvedPriority,
      userId: req.user.id,
      adminId,
      statusHistory: [
        {
          action: "Submitted",
          status: "New",
          note: "Complaint submitted",
          by: req.user.id,
        },
      ],
      attachment: req.file
        ? {
          url: `/uploads/${req.file.filename}`,
          originalName: req.file.originalname,
          fileName: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
        }
        : undefined,
    });

    return res.status(201).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("adminId", "name email");

    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({ _id: id, userId: req.user.id })
      .populate("adminId", "name email")
      .populate("userId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({ _id: id, userId: req.user.id });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const { title, place, date, time, description, priority } = req.body;

    if (title !== undefined) complaint.title = title.trim();
    if (place !== undefined) complaint.place = place.trim();
    if (date !== undefined) complaint.date = date.trim();
    if (time !== undefined) complaint.time = time.trim();
    if (description !== undefined) {
      complaint.description = description.trim();
      complaint.category = categorizeComplaint(description);
      complaint.adminId = await assignAdminByCategory(complaint.category);
    }
    if (priority !== undefined) {
      complaint.priority = priority;
    }

    complaint.statusHistory.push({
      action: "Updated",
      status: complaint.status,
      note: "User updated complaint details",
      by: req.user.id,
    });

    await complaint.save();
    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment = "" } = req.body;

    const complaint = await Complaint.findOne({ _id: id, userId: req.user.id });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if (complaint.status !== "Solved") {
      return res.status(400).json({ message: "Feedback is allowed only after complaint is solved" });
    }

    complaint.feedback = {
      rating,
      comment: comment.trim(),
      submittedAt: new Date(),
    };
    complaint.statusHistory.push({
      action: "Feedback",
      status: complaint.status,
      note: `User rating ${rating}`,
      by: req.user.id,
    });

    await complaint.save();
    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Complaint.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
