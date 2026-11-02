import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

import adminRoutes from "./routes/admin.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// Protected Routes
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Apartmentium API",
  });
});

export default app;
