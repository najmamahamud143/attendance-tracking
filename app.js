const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const env = require("./config/env");
const { globalLimiter } = require("./middleware/rateLimit");
const authRoutes = require("./routes/authRoutes");
const mobileRoutes = require("./routes/mobileRoutes");
const edgeRoutes = require("./routes/edgeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const healthRoutes = require("./routes/healthRoutes");
const { mountSwagger } = require("./swagger");
const { fail } = require("./utils/responses");

function createApp() {
  const app = express();

  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
        "style-src": ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
        "connect-src": ["'self'", "ws:", "wss:"],
        "upgrade-insecure-requests": null,
      },
    },
  }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({
    verify: (req, res, buffer) => {
      req.rawBody = buffer.toString("utf8");
    },
  }));

  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use((req, res, next) => {
    const skip = ["/health", "/api/auth/login", "/api/mobile/login", "/auth/checkin", "/auth/reverify", "/edge/ping"].includes(req.path);
    return skip ? next() : globalLimiter(req, res, next);
  });

  mountSwagger(app);
  app.use(healthRoutes);
  app.use(authRoutes);
  app.use(mobileRoutes);
  app.use(edgeRoutes);
  app.use(adminRoutes);
  app.use(analyticsRoutes);
  app.use(reportRoutes);

  app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "dashboard.html")));

  app.use((req, res) => fail(res, 404, "Route not found", "NOT_FOUND"));
  app.use((err, req, res, next) => {
    console.error(err);
    return fail(res, 500, "Internal server error", "INTERNAL_ERROR");
  });

  return app;
}

module.exports = { createApp };
