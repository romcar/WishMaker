// Authentication Routes
// Defines all authentication-related HTTP routes

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
    message: {
        success: false,
        error: "rate_limit_exceeded",
        message: "Too many authentication attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const registrationRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit registration attempts
    message: {
        success: false,
        error: "rate_limit_exceeded",
        message: "Too many registration attempts. Please try again later.",
    },
});

const webAuthnRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Allow more attempts for WebAuthn since it includes challenge generation
    message: {
        success: false,
        error: "rate_limit_exceeded",
        message: "Too many WebAuthn attempts. Please try again later.",
    },
});

// User registration
router.post("/register", registrationRateLimit, AuthController.register);

// Primary login (username/password)
router.post("/login", authRateLimit, AuthController.login);

// WebAuthn credential registration
router.post(
    "/register/webauthn/initiate",
    webAuthnRateLimit,
    AuthController.initiateWebAuthnRegistration
);
router.post(
    "/register/webauthn/complete",
    webAuthnRateLimit,
    AuthController.completeWebAuthnRegistration
);

// WebAuthn authentication (2FA)
router.post("/verify/biometric", authRateLimit, AuthController.verifyWebAuthn);

// Health check for auth service
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Authentication service is healthy",
        timestamp: new Date().toISOString(),
    });
});

export default router;
