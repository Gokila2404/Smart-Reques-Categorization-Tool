const applySecurityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
};

const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 200 } = {}) => {
  const requestLog = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const item = requestLog.get(ip) || { count: 0, start: now };

    if (now - item.start > windowMs) {
      item.count = 0;
      item.start = now;
    }

    item.count += 1;
    requestLog.set(ip, item);

    if (item.count > max) {
      return res.status(429).json({ message: "Too many requests. Try again later." });
    }

    return next();
  };
};

module.exports = { applySecurityHeaders, createRateLimiter };
