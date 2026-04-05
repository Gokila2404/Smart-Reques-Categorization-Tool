const mongoose = require("mongoose");
const crypto = require("crypto");

const buildRequestId = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `REQ-${ts}-${rand}`;
};

const complaintSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true,
      default: buildRequestId,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      default: "",
      trim: true,
    },
    time: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Networking", "Fees", "Discipline", "General"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Solved"],
      default: "New",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
