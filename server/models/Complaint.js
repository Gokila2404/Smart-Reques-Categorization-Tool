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
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
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
    statusHistory: [
      {
        action: { type: String, default: "" },
        status: { type: String, default: "" },
        note: { type: String, default: "" },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        at: { type: Date, default: Date.now },
      },
    ],
    solvedAt: {
      type: Date,
      default: null,
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    attachment: {
      url: { type: String, default: "" },
      originalName: { type: String, default: "" },
      fileName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      size: { type: Number, default: 0 },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
      submittedAt: { type: Date },
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
    hiddenForUser: {
      type: Boolean,
      default: false,
    },
    hiddenForUserAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
