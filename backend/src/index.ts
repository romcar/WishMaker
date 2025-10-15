import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import authRoutes from "./routes/auth.routes";
import wishRoutes from "./routes/wish.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase limit for WebAuthn responses
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", wishRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "WishMaker API is running" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
