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
  const { title, description } = req.body;

  if (!isNonEmptyString(title) || !isNonEmptyString(description)) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  return next();
};

const validateComplaintUpdate = (req, res, next) => {
  const { title, description, place, date, time } = req.body;

  const hasAnyField = [title, description, place, date, time].some((value) => value !== undefined);
  if (!hasAnyField) {
    return res.status(400).json({ message: "At least one field is required to update" });
  }

  const fields = { title, description, place, date, time };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && !isNonEmptyString(value)) {
      return res.status(400).json({ message: `${key} must be a non-empty string` });
    }
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

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaintCreate,
  validateComplaintUpdate,
  validateStatus,
  validateObjectIdParam,
};
