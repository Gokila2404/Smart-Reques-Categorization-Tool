const mongoose = require("mongoose");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const validateRegister = (req, res, next) => {
  const { name, email, password, role = "user", adminDomain = null } = req.body;
  const validDomains = ["Networking", "Fees", "Discipline", "General"];

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  if (role === "admin" && adminDomain && !validDomains.includes(adminDomain)) {
    return res.status(400).json({ message: "Invalid adminDomain" });
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  return next();
};

const validateComplaintCreate = (req, res, next) => {
  const { title, description, priority } = req.body;
  const validPriorities = ["High", "Medium", "Low"];

  if (!isNonEmptyString(title) || !isNonEmptyString(description)) {
    return res.status(400).json({ message: "Title and description are required" });
  }
  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: "Invalid priority" });
  }

  return next();
};

const validateComplaintUpdate = (req, res, next) => {
  const { title, description, place, date, time, priority } = req.body;
  const validPriorities = ["High", "Medium", "Low"];

  const hasAnyField = [title, description, place, date, time, priority].some((value) => value !== undefined);
  if (!hasAnyField) {
    return res.status(400).json({ message: "At least one field is required to update" });
  }

  const fields = { title, description, place, date, time };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && !isNonEmptyString(value)) {
      return res.status(400).json({ message: `${key} must be a non-empty string` });
    }
  }
  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ message: "Invalid priority" });
  }

  return next();
};

const validateStatus = (req, res, next) => {
  const { status } = req.body;
  if (!["New", "In Progress", "Solved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  return next();
};

const validateObjectIdParam = (paramName = "id") => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ message: `Invalid ${paramName}` });
  }
  return next();
};

const validateFeedback = (req, res, next) => {
  const { rating, comment = "" } = req.body;
  const ratingNum = Number(rating);

  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
  }
  if (comment !== undefined && typeof comment !== "string") {
    return res.status(400).json({ message: "Comment must be a string" });
  }
  req.body.rating = ratingNum;
  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaintCreate,
  validateComplaintUpdate,
  validateStatus,
  validateObjectIdParam,
  validateFeedback,
};
