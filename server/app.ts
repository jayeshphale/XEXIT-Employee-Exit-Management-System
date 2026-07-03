import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import calendarificRoutes from "./routes/calendarificRoutes";

const app = express();

// Apply security headers via helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP during development so preview iframe works perfectly
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Set up API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
});

// Apply rate limiter to all API endpoints
app.use("/api/", limiter);

// Modular API Routing
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/calendarific", calendarificRoutes);

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("💥 Unhandled Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "An internal server error occurred",
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

export default app;
