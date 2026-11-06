import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

import adminRoutes from "./routes/admin.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import requestRoutes from "./routes/request.routes.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL must be configured in production.");
}

app.disable("x-powered-by");
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }),
);

const trustProxyHopsValue = process.env.TRUST_PROXY_HOPS;
if (trustProxyHopsValue) {
  const trustProxyHops = Number(trustProxyHopsValue);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 1) {
    throw new Error(
      "TRUST_PROXY_HOPS must be a positive integer when configured.",
    );
  }
  app.set("trust proxy", trustProxyHops);
} else if (process.env.NODE_ENV === "production") {
  // Render terminates public traffic at one trusted reverse proxy.
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }),
);

app.use(express.json({ limit: "24mb" }));

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Apartmentium API",
  });
});

export default app;
