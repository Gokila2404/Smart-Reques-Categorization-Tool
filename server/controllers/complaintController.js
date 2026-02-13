const Complaint = require("../models/Complaint");
const User = require("../models/User");
const categorizeComplaint = require("../utils/categorize");

const assignAdminByCategory = async (category) => {
  const admin = await User.findOne({ role: "admin", adminDomain: category }).select("_id");
  if (admin) return admin._id;

  const fallback = await User.findOne({ role: "admin", adminDomain: "General" }).select("_id");
  return fallback ? fallback._id : null;
};

exports.createComplaint = async (req, res) => {
  try {
    const { title, place, date, time, description } = req.body;

    if (!title || !place || !date || !time || !description) {
      return res.status(400).json({ message: "Title, place, date, time and description are required" });
    }

    const category = categorizeComplaint(description);
    const adminId = await assignAdminByCategory(category);

    const complaint = await Complaint.create({
      title,
      place,
      date,
      time,
      description,
      category,
      userId: req.user.id,
      adminId,
    });

    return res.status(201).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
