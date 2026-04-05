const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

const notFound = (req, res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error("API error:", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
  });

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = { requestLogger, notFound, errorHandler };
