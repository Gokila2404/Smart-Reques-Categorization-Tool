const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { applySecurityHeaders, createRateLimiter } = require("./middleware/securityMiddleware");
const { requestLogger, notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(applySecurityHeaders);
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Request Categorization Backend Running");
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState,
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/complaint", require("./routes/complaintRoutes")); // Backward-compatible alias.

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
