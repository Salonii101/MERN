import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Custom Modules
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import scanRouter from "./routes/scanRouter.js";
import fileRoutes from "./routes/file.route.js";
import chatbotRouter from "./routes/chatbotRouter.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccount.js";

export const app = express();

// Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Allows flexible API usage
  })
);

// Rate Limiting (Brute-Force & Abuse Protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // limit login/register attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again in 15 minutes." },
});

app.use(globalLimiter);

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during development
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/scan", scanRouter);
app.use("/api/v1/files", fileRoutes);
app.use("/api/files", fileRoutes); // Compatibility alias
app.use("/api/v1/chatbot", chatbotRouter);

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    name: "SafeNet Cybersecurity Server",
    status: "Operational",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Scheduled Background Maintenance Jobs
try {
  removeUnverifiedAccounts();
} catch (cronErr) {
  console.warn("Cron schedule warning:", cronErr.message);
}

// Error Middleware (MUST BE LAST)
app.use(errorMiddleware);

export default app;
