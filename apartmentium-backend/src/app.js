import healthRoutes from "./routes/health.routes.js";
import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json());
app.use("/api/health", healthRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Apartmentium API",
  });
});

export default app;